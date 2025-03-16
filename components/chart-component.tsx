"use client"

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, 
  LineChart, Line,
  PieChart, Pie, 
  AreaChart, Area,
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Download, Maximize2, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function ChartComponent({ data }: { data: any }) {
  const [chartType, setChartType] = useState(data.chartType || 'bar')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("Chart data received:", data)
    if (!data.chartData || !Array.isArray(data.chartData)) {
      console.error("Invalid or missing chartData:", data)
      setError("Invalid chart data")
    }
  }, [data])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-destructive">
        <p>{error}</p>
      </div>
    )
  }

  // Function to export chart as PNG
  const exportChart = () => {
    const chartElement = document.getElementById('chart-container')
    if (chartElement) {
      // Implementation for export would go here
      // This is a placeholder for the actual export logic
      alert('Chart export functionality will be implemented here')
    }
  }

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={data.xAxis || 'name'} />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.series ? (
                data.series.map((series: string, index: number) => (
                  <Bar 
                    key={series} 
                    dataKey={series} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))
              ) : (
                <Bar 
                  dataKey={data.yAxis || 'value'} 
                  fill="#8884d8" 
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        )
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={data.xAxis || 'name'} />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.series ? (
                data.series.map((series: string, index: number) => (
                  <Line 
                    key={series} 
                    type="monotone" 
                    dataKey={series} 
                    stroke={COLORS[index % COLORS.length]} 
                  />
                ))
              ) : (
                <Line 
                  type="monotone" 
                  dataKey={data.yAxis || 'value'} 
                  stroke="#8884d8" 
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey={data.yAxis || 'value'}
                nameKey={data.xAxis || 'name'}
                label
              >
                {data.chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={data.xAxis || 'name'} />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.series ? (
                data.series.map((series: string, index: number) => (
                  <Area 
                    key={series} 
                    type="monotone" 
                    dataKey={series} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke={COLORS[index % COLORS.length]}
                    fillOpacity={0.3} 
                  />
                ))
              ) : (
                <Area 
                  type="monotone" 
                  dataKey={data.yAxis || 'value'} 
                  fill="#8884d8" 
                  stroke="#8884d8"
                  fillOpacity={0.3} 
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )
        
      default:
        return (
          <div className="flex h-full items-center justify-center">
            <p>Unsupported chart type: {chartType}</p>
          </div>
        )
    }
  }
  
  // Only show chart types that are compatible with the data
  const getAvailableChartTypes = () => {
    // For pie charts, we usually need discrete categories
    // For other charts, we're more flexible
    const chartTypes = ['bar', 'line', 'area']
    
    // Only add pie if we have a small number of data points
    if (data.chartData && data.chartData.length <= 10) {
      chartTypes.push('pie')
    }
    
    return chartTypes
  }

  return (
    <div className="rounded-md border p-2 h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">{data.title || "Chart"}</h3>
        <div className="flex gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {getAvailableChartTypes().map((type) => (
                <DropdownMenuItem 
                  key={type} 
                  onClick={() => setChartType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={exportChart}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="h-[calc(100%-2rem)]">
        {renderChart()}
      </div>
    </div>
  )
}
