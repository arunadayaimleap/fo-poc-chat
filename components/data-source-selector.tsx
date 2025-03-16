'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Database, FileSpreadsheet, Globe, Loader2 } from 'lucide-react'
import { useChatStore } from '@/lib/stores/chat-store'
import { CSVUpload } from '@/components/csv-upload'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { cn } from '@/lib/utils'
import axios from 'axios'
import { DataSource } from '@/lib/db'
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

// Type definitions for the form
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  type: z.enum(["postgresql", "mysql", "mongodb", "csv", "api"]),
  connectionString: z.string().optional(),
  apiKey: z.string().optional(),
  apiEndpoint: z.string().optional(),
  hostname: z.string().optional(),
  port: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  database: z.string().optional(),
})

export function DataSourceSelector() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [activeDataSource, setActiveDataSource] = useChatStore((state) => [
    state.activeDataSource,
    state.setActiveDataSource,
  ])

  // Fetch data sources on component mount
  useEffect(() => {
    const fetchDataSources = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/datasources')
        setDataSources(response.data)
      } catch (error) {
        console.error('Failed to fetch data sources:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDataSources()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "postgresql",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const config = {
        connectionString: values.connectionString,
        apiKey: values.apiKey,
        apiEndpoint: values.apiEndpoint,
        hostname: values.hostname,
        port: values.port,
        username: values.username,
        password: values.password,
        database: values.database,
      }
      
      const response = await axios.post('/api/datasources', {
        name: values.name,
        type: values.type,
        config
      })
      
      setDataSources([...dataSources, response.data])
      setActiveDataSource(response.data)
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error('Failed to create data source:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper to get the right form fields based on the selected data source type
  const renderDatasourceSpecificFields = () => {
    const type = form.watch("type")
    
    switch (type) {
      case "postgresql":
      case "mysql":
        return (
          <>
            <FormField
              control={form.control}
              name="hostname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hostname</FormLabel>
                  <FormControl>
                    <Input placeholder="localhost" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port</FormLabel>
                  <FormControl>
                    <Input placeholder={type === "postgresql" ? "5432" : "3306"} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="database"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )
      case "mongodb":
        return (
          <FormField
            control={form.control}
            name="connectionString"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Connection String</FormLabel>
                <FormControl>
                  <Input placeholder="mongodb://localhost:27017/db" {...field} />
                </FormControl>
                <FormDescription>
                  The MongoDB connection string including credentials.
                </FormDescription>
              </FormItem>
            )}
          />
        )
      case "api":
        return (
          <>
            <FormField
              control={form.control}
              name="apiEndpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Endpoint</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.example.com/data" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )
      default:
        return null
    }
  }

  const getIconForType = (type: DataSource['type']) => {
    switch (type) {
      case 'postgresql':
      case 'mysql':
      case 'mongodb':
        return <Database className="h-4 w-4" />
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />
      case 'api':
        return <Globe className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-2 py-3 space-y-0 flex flex-row justify-between items-center">
        <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add data source</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Data Source</DialogTitle>
              <DialogDescription>
                Connect to a database, upload a CSV file, or use an API endpoint.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Database" {...field} />
                      </FormControl>
                      <FormDescription>
                        A friendly name for your data source
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a data source type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="postgresql">PostgreSQL</SelectItem>
                          <SelectItem value="mysql">MySQL</SelectItem>
                          <SelectItem value="mongodb">MongoDB</SelectItem>
                          <SelectItem value="csv">CSV File</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {renderDatasourceSpecificFields()}
                
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Data Source
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent className="px-2 py-0">
        <div className="space-y-2">
          <CSVUpload />
        </div>
        
        <div className="space-y-1 mt-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : dataSources.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No data sources found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add a data source to begin
              </p>
            </div>
          ) : (
            dataSources.map((source) => (
              <Button 
                key={source.id}
                variant="ghost" 
                className={cn(
                  "w-full justify-start px-2 rounded-md", 
                  activeDataSource?.id === source.id && "bg-accent font-medium"
                )}
                onClick={() => setActiveDataSource(source)}
              >
                {getIconForType(source.type)}
                <span className="ml-2 truncate">{source.name}</span>
              </Button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
