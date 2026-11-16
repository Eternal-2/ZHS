-- =====================================================================
-- Verifikasi pemandu: penyimpanan dokumen privat, pengajuan, dan peninjauan admin
-- Jalankan SETELAH 0001_schema.sql. Aman dijalankan berulang kali.
-- =====================================================================

-- ---------- 1. Bucket privat untuk KTP, selfie, CV, sertifikat, portofolio ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('guide-documents', 'guide-documents', false, 10485760,
        array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Struktur path wajib: <user_id>/<nama-file>. User hanya boleh menyentuh folder miliknya; admin boleh membaca semua.
drop policy if exists "guide docs upload own" on storage.objects;
create policy "guide docs upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'guide-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "guide docs read own or admin" on storage.objects;
create policy "guide docs read own or admin" on storage.objects for select to authenticated
  using (bucket_id = 'guide-documents'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

drop policy if exists "guide docs delete own" on storage.objects;
create policy "guide docs delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'guide-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- 2. PERBAIKAN KEAMANAN: batasi kolom yang boleh diubah langsung dari browser ----------
-- Sebelumnya kebijakan UPDATE mengizinkan user mengubah SEMUA kolom miliknya (mis. poin, rating,
-- status verifikasi). Sekarang hanya kolom biasa yang boleh; kolom sensitif hanya lewat fungsi server.
revoke update on profiles from anon, authenticated;
grant update (full_name, username, phone, avatar_url, gender, birth_date, nationality, address, city,
              country, languages, travel_preferences, emergency_name, emergency_phone)
  on profiles to authenticated;

revoke update on guides from anon, authenticated;
grant update (bio, specialties, languages, price_per_day, base_location, base_lat, base_lng, work_hours,
              is_available, bank_name, bank_account_holder, bank_account_number)
  on guides to authenticated;

-- ---------- 3. Pemandu mengajukan / mengajukan ulang ----------
-- p_docs: [{"type":"ktp","path":"<user_id>/ktp-123.jpg"}, ...]
-- Pengajuan pertama mengirim semua jenis dokumen. Pengajuan ulang cukup mengirim jenis yang diperbaiki
-- (kirim NULL untuk data profesional agar nilai lama dipertahankan).
create or replace function submit_guide_application(
  p_docs jsonb,
  p_phone text default null, p_address text default null,
  p_specialties text[] default null, p_languages text[] default null,
  p_price_per_day int default null, p_work_hours text default null, p_base_location text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  existing guides;
begin
  if uid is null then raise exception 'Harus login'; end if;
  if p_docs is null or jsonb_typeof(p_docs) <> 'array' or jsonb_array_length(p_docs) = 0 then
    raise exception 'Dokumen belum dilampirkan';
  end if;
  if exists (select 1 from jsonb_array_elements(p_docs) x where split_part(x->>'path','/',1) <> uid::text) then
    raise exception 'Lokasi file dokumen tidak valid';
  end if;

  select * into existing from guides where id = uid;
  if found and existing.verification = 'approved' then
    raise exception 'Akun Anda sudah terverifikasi sebagai pemandu';
  end if;

  update profiles set phone = coalesce(p_phone, phone), address = coalesce(p_address, address) where id = uid;

  insert into guides (id, specialties, languages, price_per_day, work_hours, base_location, verification, is_available)
  values (uid, coalesce(p_specialties,'{}'), coalesce(p_languages,'{}'), coalesce(p_price_per_day,0),
          p_work_hours, p_base_location, 'pending', true)
  on conflict (id) do update set
    specialties   = coalesce(p_specialties,   guides.specialties),
    languages     = coalesce(p_languages,     guides.languages),
    price_per_day = coalesce(p_price_per_day, guides.price_per_day),
    work_hours    = coalesce(p_work_hours,    guides.work_hours),
    base_location = coalesce(p_base_location, guides.base_location),
    verification  = 'pending',
    verification_note = null;

  -- ganti dokumen lama bertipe sama yang belum disetujui; dokumen yang sudah disetujui dipertahankan
  delete from guide_documents
   where guide_id = uid and status <> 'approved'
     and type in (select (x->>'type')::doc_type from jsonb_array_elements(p_docs) x);

  insert into guide_documents (guide_id, type, storage_path, status)
  select uid, (x->>'type')::doc_type, x->>'path', 'pending' from jsonb_array_elements(p_docs) x;
end $$;

-- ---------- 4. Peninjauan admin ----------
create or replace function admin_review_document(p_doc uuid, p_approve boolean, p_note text default null)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Hanya admin yang dapat meninjau dokumen'; end if;
  if not p_approve and coalesce(btrim(p_note), '') = '' then
    raise exception 'Alasan penolakan wajib diisi';
  end if;
  update guide_documents
     set status = (case when p_approve then 'approved' else 'rejected' end)::verify_status,
         admin_note = case when p_approve then null else btrim(p_note) end
   where id = p_doc;
  if not found then raise exception 'Dokumen tidak ditemukan'; end if;
end $$;

-- Hasil akhir: 'approved' (role jadi pemandu) atau 'rejected' (pemandu diminta memperbaiki dokumen)
create or replace function admin_finalize_guide(p_guide uuid) returns text
language plpgsql security definer set search_path = public as $$
declare pending_n int; rejected_n int; missing_n int;
begin
  if not is_admin() then raise exception 'Hanya admin yang dapat memutuskan verifikasi'; end if;

  select count(*) filter (where status = 'pending'), count(*) filter (where status = 'rejected')
    into pending_n, rejected_n from guide_documents where guide_id = p_guide;
  if pending_n > 0 then
    raise exception 'Masih ada % dokumen yang belum ditinjau', pending_n;
  end if;

  select count(*) into missing_n
    from unnest(array['ktp','selfie','cv','certificate','portfolio']::doc_type[]) as req(tp)
   where not exists (select 1 from guide_documents d
                      where d.guide_id = p_guide and d.type = req.tp and d.status = 'approved');

  if rejected_n > 0 or missing_n > 0 then
    update guides set verification = 'rejected',
           verification_note = 'Ada dokumen yang perlu diperbaiki. Lihat alasan pada tiap dokumen.'
     where id = p_guide;
    insert into notifications (user_id, title, body, link_screen)
    values (p_guide, 'Verifikasi pemandu ditolak', 'Beberapa dokumen perlu diperbaiki lalu diajukan ulang.', 'guide-verification-status');
    return 'rejected';
  end if;

  update guides set verification = 'approved', badge_verified = true, verification_note = null where id = p_guide;
  update profiles set role = 'pemandu', is_verified = true where id = p_guide;
  insert into notifications (user_id, title, body, link_screen)
  values (p_guide, 'Profil Anda telah terverifikasi', 'Selamat! Anda kini dapat menerima booking.', 'guide-dashboard');
  return 'approved';
end $$;
