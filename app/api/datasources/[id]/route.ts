import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params {
  params: {
    id: string
  }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params
    const dataSource = db.dataSources.get(id)
    
    if (!dataSource) {
      return NextResponse.json(
        { error: "Data source not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(dataSource)
  } catch (error) {
    console.error(`Error fetching data source ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch data source" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = params
    const updates = await req.json()
    
    const updatedDataSource = db.dataSources.update(id, updates)
    
    if (!updatedDataSource) {
      return NextResponse.json(
        { error: "Data source not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedDataSource)
  } catch (error) {
    console.error(`Error updating data source ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to update data source" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = params
    const success = db.dataSources.delete(id)
    
    if (!success) {
      return NextResponse.json(
        { error: "Data source not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting data source ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to delete data source" },
      { status: 500 }
    )
  }
}
