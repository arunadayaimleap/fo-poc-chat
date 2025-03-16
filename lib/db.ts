import fs from 'fs'
import path from 'path'
import { parse } from 'papaparse' // We'll need to add this dependency

// Define database file paths
const DATA_DIR = path.join(process.cwd(), 'data')
const QUERIES_FILE = path.join(DATA_DIR, 'queries.json')
const DATA_SOURCES_FILE = path.join(DATA_DIR, 'datasources.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Initialize files if they don't exist
if (!fs.existsSync(QUERIES_FILE)) {
  fs.writeFileSync(QUERIES_FILE, JSON.stringify([]), 'utf8')
}

if (!fs.existsSync(DATA_SOURCES_FILE)) {
  const initialDataSources = [
    { 
      id: '1', 
      name: 'Sample PostgreSQL DB', 
      type: 'postgresql',
      config: { hostname: 'localhost', port: 5432 }
    },
    { 
      id: '2', 
      name: 'Sales Data (CSV)', 
      type: 'csv',
      config: { filename: 'sales_2023.csv' }
    },
    { 
      id: '3', 
      name: 'Weather API', 
      type: 'api',
      config: { endpoint: 'https://api.weather.com' }
    }
  ]
  fs.writeFileSync(DATA_SOURCES_FILE, JSON.stringify(initialDataSources), 'utf8')
}

// Types
export type DataSource = {
  id: string
  name: string
  type: 'postgresql' | 'mysql' | 'mongodb' | 'csv' | 'api'
  config: any
  createdAt?: string
  updatedAt?: string
}

export type Query = {
  id: string
  content: string
  result?: any
  createdAt: string
  dataSourceId?: string | null
}

// Add CSV processing functions
const csvUtils = {
  parseFile: (filePath: string): { headers: string[], data: any[][] } => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const result = parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      })
      
      // Extract headers
      const headers = result.meta.fields || []
      
      // Convert data to array format for easier display
      const rows = result.data.map((row: any) => 
        headers.map(header => row[header])
      )
      
      return {
        headers,
        data: rows
      }
    } catch (error) {
      console.error(`Error parsing CSV file: ${filePath}`, error)
      return {
        headers: [],
        data: []
      }
    }
  },

  getPreview: (filePath: string, rows: number = 5): { headers: string[], data: any[][] } => {
    try {
      const { headers, data } = csvUtils.parseFile(filePath)
      return {
        headers,
        data: data.slice(0, rows)
      }
    } catch (error) {
      console.error(`Error getting CSV preview: ${filePath}`, error)
      return {
        headers: [],
        data: []
      }
    }
  }
}

// DB operations
export const db = {
  queries: {
    getAll: (): Query[] => {
      const data = fs.readFileSync(QUERIES_FILE, 'utf8')
      return JSON.parse(data)
    },
    get: (id: string): Query | undefined => {
      const queries = db.queries.getAll()
      return queries.find(q => q.id === id)
    },
    create: (query: Omit<Query, 'id' | 'createdAt'>): Query => {
      const queries = db.queries.getAll()
      const newQuery: Query = {
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        ...query
      }
      
      queries.push(newQuery)
      fs.writeFileSync(QUERIES_FILE, JSON.stringify(queries), 'utf8')
      return newQuery
    }
  },
  dataSources: {
    getAll: (): DataSource[] => {
      const data = fs.readFileSync(DATA_SOURCES_FILE, 'utf8')
      return JSON.parse(data)
    },
    get: (id: string): DataSource | undefined => {
      const dataSources = db.dataSources.getAll()
      return dataSources.find(ds => ds.id === id)
    },
    create: (dataSource: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>): DataSource => {
      const dataSources = db.dataSources.getAll()
      const now = new Date().toISOString()
      const newDataSource: DataSource = {
        id: Math.random().toString(36).substring(2, 9),
        createdAt: now,
        updatedAt: now,
        ...dataSource
      }
      
      dataSources.push(newDataSource)
      fs.writeFileSync(DATA_SOURCES_FILE, JSON.stringify(dataSources), 'utf8')
      return newDataSource
    },
    update: (id: string, updates: Partial<DataSource>): DataSource | null => {
      const dataSources = db.dataSources.getAll()
      const index = dataSources.findIndex(ds => ds.id === id)
      
      if (index === -1) return null
      
      const updatedDataSource = {
        ...dataSources[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      dataSources[index] = updatedDataSource
      fs.writeFileSync(DATA_SOURCES_FILE, JSON.stringify(dataSources), 'utf8')
      return updatedDataSource
    },
    delete: (id: string): boolean => {
      const dataSources = db.dataSources.getAll()
      const filteredSources = dataSources.filter(ds => ds.id !== id)
      
      if (filteredSources.length === dataSources.length) return false
      
      fs.writeFileSync(DATA_SOURCES_FILE, JSON.stringify(filteredSources), 'utf8')
      return true
    }
  },
  csv: {
    getPreview: (dataSourceId: string): { headers: string[], data: any[][] } => {
      const dataSource = db.dataSources.get(dataSourceId)
      if (!dataSource || dataSource.type !== 'csv' || !dataSource.config?.path) {
        return { headers: [], data: [] }
      }
      
      return csvUtils.getPreview(dataSource.config.path)
    },
    
    getData: (dataSourceId: string): { headers: string[], data: any[][] } => {
      const dataSource = db.dataSources.get(dataSourceId)
      if (!dataSource || dataSource.type !== 'csv' || !dataSource.config?.path) {
        return { headers: [], data: [] }
      }
      
      return csvUtils.parseFile(dataSource.config.path)
    }
  }
}
