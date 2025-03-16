import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { db } from "@/lib/db";

// Define uploads directory
const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Create a unique filename
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    
    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, new Uint8Array(buffer));
    
    // Create a data source entry for the CSV
    const dataSource = db.dataSources.create({
      name: name || file.name,
      type: 'csv',
      config: {
        filename: fileName,
        originalName: file.name,
        path: filePath
      }
    });

    return NextResponse.json({
      success: true,
      dataSource
    }, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
