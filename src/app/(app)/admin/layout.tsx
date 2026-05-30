'use client'

import AdminNav from '@/components/admin/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <AdminNav />
      <main className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden min-w-0">
        {children}
      </main>
    </div>
  )
}
