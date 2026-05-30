'use client'

import AdminNav from '@/components/admin/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full">
      <AdminNav />
      <main className="flex flex-1 flex-col overflow-auto">
        {children}
      </main>
    </div>
  )
}
