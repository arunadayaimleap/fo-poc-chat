import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - ChatData',
  description: 'Ask questions about your data using natural language',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
