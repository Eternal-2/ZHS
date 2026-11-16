# Zam Zam Hidden Spot (Next.js + Supabase + Vercel)

## 1. Siapkan Supabase
1. Buat project di supabase.com.
2. **SQL Editor**, jalankan berurutan: `0001_schema.sql`, `0003_guide_verification.sql`, `0005_tourist_features.sql`,
   `0006_admin.sql`, `0007_booking_guards.sql`, `seed.sql`, lalu `0002_cron.sql` (aktifkan extension `pg_cron` dulu).
   Untuk development saja: `seed_demo_guides.sql`.
   Database yang sudah berjalan: cukup tambahkan yang belum pernah dijalankan (`0003`, `0005`, `0006`, `0007`).
   `0004_fix_create_booking.sql` sudah digantikan oleh `0007` (tidak perlu dijalankan lagi).
   Catatan `0007`: satu pemandu hanya bisa menerima satu tur per hari, dan hanya bisa dipesan untuk destinasi yang
   ia layani (pemandu mengatur ini di dashboard-nya). `0006` menyiapkan fungsi untuk panel admin yang lebih lengkap.
3. **Authentication > Providers**: aktifkan Email (nyalakan *Confirm email*), Google/Facebook bila perlu.
   Ubah template email "Confirm signup" agar memakai kode: `{{ .Token }}`.
4. **Authentication > URL Configuration**: isi Site URL dan Redirect URLs (`http://localhost:3000` dan alamat Vercel).
5. **Storage**: bucket `guide-documents` (privat) dibuat otomatis oleh `0003`. Bucket `avatars`/`destination-images` dibuat manual bila dipakai.

## 2. Environment frontend
Salin `.env.example` menjadi `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxx
```
Hanya dua variabel itu. Jangan menaruh Secret key Supabase, kunci Gemini, atau kunci Midtrans di sini.

## 3. Jalankan
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## 4. Chat AI & pembayaran: Edge Functions (backend)
Chat AI hanya berfungsi setelah **kunci Gemini** dipasang dan fungsinya **dideploy** (sekali, dan setiap kode fungsinya berubah).
```bash
npm i -g supabase
supabase login && supabase link --project-ref <PROJECT_REF>
supabase secrets set GEMINI_API_KEY=... MIDTRANS_SERVER_KEY=... MIDTRANS_IS_PRODUCTION=false
supabase functions deploy ai-chat create-payment payment-webhook
```
`supabase/config.toml` sudah mengatur `ai-chat` tanpa verifikasi JWT (pengunjung belum login boleh bertanya; dibatasi
10 pesan/10 menit per IP, dan 30 pesan/10 menit per akun). Model Gemini bisa diganti lewat secret `GEMINI_MODELS`
(daftar dipisah koma, dicoba berurutan). Log fungsi: Supabase > Edge Functions > ai-chat > Logs.

**Mencoba alur pembayaran tanpa Midtrans (mode uji).** Di SQL Editor:
```sql
update app_settings set value = '"demo"' where key = 'payment_mode';      -- aktifkan mode uji
update app_settings set value = '"midtrans"' where key = 'payment_mode';  -- WAJIB dikembalikan sebelum produksi
```
Pada mode uji, layar pembayaran menampilkan tombol "Simulasikan Pembayaran Berhasil"; tidak ada uang yang dipindahkan.
Daftarkan URL `.../functions/v1/payment-webhook` di Midtrans > Settings > Payment > Notification URL.

## 5. Deploy ke Vercel
- Production Branch: `main`. Framework Preset: **Next.js**. Kosongkan semua Override (Build Command, Output Directory).
- Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Setelah mengubahnya, wajib Redeploy.

## Verifikasi pemandu
Alur: calon pemandu login, mengisi formulir (foto KTP & wajah lewat kamera, unggah CV/sertifikat/portofolio) ->
dokumen masuk bucket privat `guide-documents` dengan status **menunggu** -> admin meninjau tiap dokumen di panel admin ->
semua disetujui: role akun otomatis menjadi `pemandu`; ada yang ditolak: pemandu memperbaiki dan mengajukan ulang.

**Akun admin & alamat khusus admin.** Admin masuk lewat halaman terpisah di **`/admin`**
(contoh: `https://zhs-xi.vercel.app/admin`). Halaman itu tidak ditautkan dari mana pun di aplikasi dan diberi
`noindex`. Login publik **menolak** akun admin (dengan pesan "email/password salah" yang sama).
Untuk mengganti alamatnya, ganti nama folder `src/app/admin` (mis. `src/app/kelola-7f3k`), lalu deploy ulang.

Membuat akun admin:
1. Supabase > **Authentication > Users > Add user > Create new user**: isi email & password, centang **Auto Confirm User**.
2. Di SQL Editor:
```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'email-admin@anda.com');
```
3. Buka `/admin` dan login dengan email & password itu.

Penting: menyembunyikan alamat bukan pengamanan. Pengamanan sebenarnya ada di database (semua fungsi `admin_*` dan akses data
memeriksa role `admin`). Pakai password panjang yang unik; sebaiknya aktifkan juga MFA di akun admin.

## Belum tersambung ke database
- Pencocokan wajah otomatis (saat ini admin mencocokkan foto selfie dengan KTP secara manual).
- Tab harga/area pemandu, dispute/laporan masalah, pemindai QR lewat kamera di sisi pemandu.
- Refund otomatis ke payment gateway setelah `cancel_booking` / booking kedaluwarsa.
