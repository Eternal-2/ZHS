'use client';

import dynamic from 'next/dynamic';

// Aplikasi ini adalah SPA berbasis state (layar berpindah lewat zustand), jadi dirender di browser saja.
const App = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-[#19324d] text-sm font-semibold">
      Memuat Zam Zam Hidden Spot…
    </div>
  )
});

export default function Page() {
  return <App />;
}
