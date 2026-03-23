// Отключаем static generation
export const dynamic = 'force-dynamic'

export default function OrderSuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
