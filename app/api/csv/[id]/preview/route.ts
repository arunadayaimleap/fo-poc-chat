import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: {
    id: string
  }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const dataSource = db.dataSources.get(id);
    
    if (!dataSource) {
      return NextResponse.json(
        { error: "Data source not found" },
        { status: 404 }
      );
    }
    
    if (dataSource.type !== 'csv') {
      return NextResponse.json(
        { error: "Data source is not a CSV file" },
        { status: 400 }
      );
    }
    
    const preview = db.csv.getPreview(id);
    
    return NextResponse.json({
      dataSource,
      preview
    });
  } catch (error) {
    console.error(`Error previewing CSV data ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to preview CSV data" },
      { status: 500 }
    );
  }
}
