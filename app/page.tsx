import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <h1 className="text-xl font-bold">ChatData</h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="container flex-1 py-10">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-8 text-center">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Converse with your data in plain English
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            ChatData is an interactive chat-based interface that allows you to query structured datasets using natural language.
            Get insights from your data through text, charts, and tables.
          </p>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/examples">
              <Button variant="outline" size="lg">View Examples</Button>
            </Link>
          </div>
        </div>
      </main>
      <footer className="container py-6 md:px-8 md:py-0">
        <div className="flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ChatData. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with Next.js and ShadCN UI
          </p>
        </div>
      </footer>
    </div>
  )
}
