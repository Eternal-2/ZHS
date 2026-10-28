# Zam Zam Hidden Spot (Next.js + Supabase + Vercel)

## 1. Siapkan Supabase
1. Buat project di supabase.com.
2. **SQL Editor**, jalankan berurutan: `supabase/migrations/0001_schema.sql`, `supabase/seed.sql`, lalu `0002_cron.sql`
   (aktifkan extension `pg_cron` dulu). Untuk development saja: `supabase/seed_demo_guides.sql`.
3. **Authentication > Providers**: aktifkan Email (nyalakan *Confirm email*), Google/Facebook bila perlu.
   Ubah template email "Confirm signup" agar memakai kode: `{{ .Token }}`.
4. **Authentication > URL Configuration**: isi Site URL dan Redirect URLs (`http://localhost:3000` dan alamat Vercel).
5. **Storage**: bucket `avatars`, `destination-images` (publik), `guide-documents`, `dispute-evidence` (privat).

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

## 4. Edge Functions (backend)
```bash
npm i -g supabase
supabase login && supabase link --project-ref <PROJECT_REF>
supabase secrets set GEMINI_API_KEY=... MIDTRANS_SERVER_KEY=... MIDTRANS_IS_PRODUCTION=false
supabase functions deploy ai-chat create-payment payment-webhook
```
Daftarkan URL `.../functions/v1/payment-webhook` di Midtrans > Settings > Payment > Notification URL.

## 5. Deploy ke Vercel
- Production Branch: `main`. Framework Preset: **Next.js**. Kosongkan semua Override (Build Command, Output Directory).
- Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Setelah mengubahnya, wajib Redeploy.

## Menjadikan akun admin / pemandu
`update profiles set role = 'admin' where id = '<uuid>';`
Pemandu: setelah verifikasi, `update profiles set role='pemandu' where id=...;` lalu isi baris di tabel `guides` (`verification = 'approved'`).

## Belum tersambung ke database
- Form registrasi pemandu (unggah dokumen, pembuatan baris `guides`).
- Tab harga/area pemandu, notifikasi, tiket bantuan, dispute, panel admin.
- Refund otomatis ke payment gateway setelah `cancel_booking` / booking kedaluwarsa.
