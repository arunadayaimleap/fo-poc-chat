'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChatMessage } from '@/components/chat-message'
import { ArrowUpIcon, Loader2, RefreshCw, AlertTriangle } from 'lucide-react'
import { useChatStore } from '@/lib/stores/chat-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import axios from 'axios'

export function ChatInterface() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [dataSource, setActiveDataSource] = useChatStore((state) => [
    state.activeDataSource,
    state.setActiveDataSource,
  ])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when dataSource changes
  useEffect(() => {
    if (dataSource && inputRef.current) {
      inputRef.current.focus()
    }
  }, [dataSource])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || !dataSource) return
    
    try {
      setError(null)
      setLoading(true)
      
      // Add the user message immediately
      const userMessage = { role: 'user', content: input, id: Date.now().toString() }
      setMessages(prev => [...prev, userMessage])
      
      // Clear input
      setInput('')
      
      // Send to API
      console.log('Sending message to API:', userMessage.content)
      const response = await axios.post('/api/chat', {
        messages: [...messages, userMessage],
        dataSourceId: dataSource.id
      })
      
      // Check if we have a successful response
      if (response.status === 200) {
        console.log('API Response:', response.data)
        const aiMessage = {
          id: Date.now().toString() + '-ai',
          ...response.data
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        console.error('API error:', response)
        setError(`Error: ${response.statusText}`)
      }
    } catch (err: any) {
      console.error('Chat error:', err)
      setError(`Error: ${err.message || 'Something went wrong'}`)
    } finally {
      setLoading(false)
    }
  }

  const resetChat = () => {
    setMessages([])
    setError(null)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="px-4 py-3 border-b flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Chat</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full"
            title="Clear chat"
            onClick={resetChat}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Clear chat</span>
          </Button>
          <div className="text-sm text-muted-foreground">
            {dataSource ? `${dataSource.name}` : 'No data source'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 overflow-auto" ref={scrollAreaRef}>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              {error && error.includes('API key') && (
                <p className="mt-2">
                  Make sure your OpenAI API key is correctly set in the .env.local file.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="flex h-[calc(100%-2rem)] items-center justify-center">
              <div className="text-center max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-2">Welcome to ChatData</h3>
                <p className="text-muted-foreground mb-6">
                  Ask questions about your data in plain English and get insights through text, charts, and tables.
                </p>
                {dataSource ? (
                  <p className="text-sm text-primary">
                    Connected to {dataSource.name}
                  </p>
                ) : (
                  <p className="text-sm text-amber-500">
                    Please select a data source to begin
                  </p>
                )}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                ChatData is thinking...
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center w-full gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={dataSource ? "Ask a question about your data..." : "Select a data source to begin..."}
            disabled={!dataSource || loading}
            className="flex-1"
            ref={inputRef}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!dataSource || loading || !input.trim()}
            className="rounded-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpIcon className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
