import type { Metadata } from 'next';

// Halaman ini tidak ditautkan dari mana pun dan tidak boleh diindeks mesin pencari.
export const metadata: Metadata = {
  title: 'Panel Admin ZHS',
  robots: { index: false, follow: false, nocache: true }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
