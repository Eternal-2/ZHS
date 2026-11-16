// Pelengkap tipe untuk EDITOR saja (VS Code). Edge Functions berjalan di Deno, bukan Node, sehingga
// editor tidak mengenal objek `Deno` dan impor berbasis URL. File ini tidak ikut ter-deploy dan tidak
// memengaruhi build Next.js/Vercel.
declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): unknown;
};

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
}
