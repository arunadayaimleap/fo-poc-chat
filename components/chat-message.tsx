"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { ChartComponent } from "@/components/chart-component"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isUser = message.role === "user"
  
  // Function to parse content to find chart/table data
  const parseContent = () => {
    try {
      // Check if the content contains any JSON that might include chart data
      const jsonMatch = message.content.match(/```json\n([\s\S]*?)\n```/)
      
      if (jsonMatch && jsonMatch[1]) {
        const parsed = JSON.parse(jsonMatch[1])
        
        // Clean content (remove the JSON part)
        const cleanContent = message.content.replace(/```json\n[\s\S]*?\n```/, '')
        
        return {
          text: cleanContent.trim(),
          data: parsed
        }
      }
      
      return { text: message.content, data: null }
    } catch (e) {
      console.error("Failed to parse JSON from message:", e)
      return { text: message.content, data: null }
    }
  }
  
  const { text, data } = parseContent()

  // Simplified rendering of chart data
  const renderVisualization = () => {
    if (!data) return null
    
    if (data.chartType) {
      return (
        <Card className="mt-4 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">{data.title || "Chart"}</h4>
            <div className="text-xs text-muted-foreground">{data.chartType} chart</div>
          </div>
          <div className="w-full h-64 relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ChartComponent data={data} />
            )}
          </div>
        </Card>
      )
    }
    
    if (data.tableData) {
      return (
        <Card className="mt-4 overflow-hidden">
          <div className="border-b px-4 py-2">
            <h4 className="text-sm font-medium">Table Data</h4>
          </div>
          <div className="max-h-80 overflow-auto p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  {data.tableData.headers.map((header: string, i: number) => (
                    <th key={i} className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.tableData.rows.map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex} className={rowIndex % 2 ? "bg-muted/30" : ""}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-2 text-sm">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )
    }
    
    return null
  }

  return (
    <div className={cn("flex flex-col space-y-1.5", isUser ? "items-end" : "items-start")}>
      <div className="flex items-center gap-2">
        {!isUser && (
          <Avatar className="h-8 w-8">
            <AvatarImage src="/bot-avatar.png" alt="AI Assistant" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">AI</AvatarFallback>
          </Avatar>
        )}
        <span className="text-xs text-muted-foreground">
          {isUser ? "You" : "ChatData AI"}
        </span>
        {isUser && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">You</AvatarFallback>
          </Avatar>
        )}
      </div>
      <div className={cn("max-w-[80%] space-y-2", isUser ? "ml-auto" : "mr-auto")}>
        <div className={cn(
          "rounded-lg px-4 py-2 shadow-sm",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {text}
          </div>
        </div>
        
        {data && renderVisualization()}
      </div>
    </div>
  )
}
