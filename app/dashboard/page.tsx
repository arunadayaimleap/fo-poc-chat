import { ChatInterface } from '@/components/chat-interface'
import { DataSourceSelector } from '@/components/data-source-selector'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export const metadata: Metadata = {
  title: 'Dashboard - ChatData',
  description: 'Ask questions about your data using natural language',
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <a href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">ChatData</span>
            </a>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="mr-2 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="pt-4">
                <DataSourceSelector />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1" />
          <nav className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/examples">Examples</a>
            </Button>
          </nav>
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[240px_1fr] md:gap-6 lg:grid-cols-[280px_1fr] lg:gap-10 py-6">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <div className="h-full py-6 pl-2">
            <DataSourceSelector />
          </div>
        </aside>
        <main className="flex w-full flex-col">
          <div className="flex h-[calc(100vh-8rem)] flex-col">
            <ChatInterface />
          </div>
        </main>
      </div>
    </div>
  )
}
