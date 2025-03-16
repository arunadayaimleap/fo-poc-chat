import { NextRequest, NextResponse } from "next/server"
import { db, DataSource } from "@/lib/db"

export async function GET() {
  try {
    const dataSources = db.dataSources.getAll()
    return NextResponse.json(dataSources)
  } catch (error) {
    console.error("Error fetching data sources:", error)
    return NextResponse.json(
      { error: "Failed to fetch data sources" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, type, config } = body
    
    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      )
    }
    
    const newDataSource = db.dataSources.create({ name, type, config })
    
    return NextResponse.json(newDataSource, { status: 201 })
  } catch (error) {
    console.error("Error creating data source:", error)
    return NextResponse.json(
      { error: "Failed to create data source" },
      { status: 500 }
    )
  }
}
