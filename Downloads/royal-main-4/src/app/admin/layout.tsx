// Отключаем static generation для всех admin страниц
export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
