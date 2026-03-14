import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Anfloy — AI Assistant',
  description: 'Chat with Anfloy\'s AI assistant',
}

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
