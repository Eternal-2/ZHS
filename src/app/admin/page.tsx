'use client';

import dynamic from 'next/dynamic';

const AdminPortal = dynamic(() => import('../../components/AdminPortal'), { ssr: false });

export default function AdminPage() {
  return <AdminPortal />;
}
