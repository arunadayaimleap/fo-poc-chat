import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import axios from "axios"

export async function POST(req: Request) {
  try {
    console.log("Chat API called")
    const { messages, dataSourceId } = await req.json()
    console.log("Received messages:", messages)
    console.log("Data source ID:", dataSourceId)
    
    // Extract the last message (user's query)
    const userMessage = messages[messages.length - 1]
    
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables")
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      )
    }

    // Check if data source exists
    let dataSourceInfo = null
    if (dataSourceId) {
      const dataSource = db.dataSources.get(dataSourceId)
      if (dataSource) {
        dataSourceInfo = `You're analyzing data from: ${dataSource.name} (${dataSource.type})`
      }
    }
    
    console.log("Sending request to OpenAI...")
    
    try {
      // Use axios to make a request to the OpenAI API
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a data analytics assistant that helps users analyze their data. 
              ${dataSourceInfo || ''}
              When appropriate, provide insights in the form of charts or tables. 
              Use JSON format to define charts or tables. Example response with a chart:
              
              Based on your data, I can see that sales have been increasing over the past quarter.
              
              \`\`\`json
              {
                "chartType": "bar",
                "title": "Quarterly Sales",
                "xAxis": "quarter",
                "yAxis": "sales",
                "chartData": [
                  {"quarter": "Q1", "sales": 120000},
                  {"quarter": "Q2", "sales": 145000},
                  {"quarter": "Q3", "sales": 160000},
                  {"quarter": "Q4", "sales": 190000}
                ]
              }
              \`\`\`
              
              For tables, use this format:
              
              \`\`\`json
              {
                "tableData": {
                  "headers": ["Name", "Age", "City"],
                  "rows": [
                    ["John", 32, "New York"],
                    ["Alice", 28, "San Francisco"]
                  ]
                }
              }
              \`\`\`
              
              Generate realistic sample data that could answer the user's query when you don't have actual data. Always provide thoughtful analysis along with visualizations.`
            },
            ...messages,
            {
              role: "user",
              content: `Please provide the JSON data for any charts or tables you mention in your response.`
            }
          ],
          temperature: 0.7,
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Received response from OpenAI")

      try {
        // Store the query in file database
        db.queries.create({
          content: userMessage.content,
          dataSourceId: dataSourceId || null,
        })
      } catch (dbError) {
        console.error("Error saving query to database:", dbError)
        // Continue even if saving to DB fails
      }

      // Return the AI's response
      return NextResponse.json({
        role: "assistant",
        content: response.data.choices[0].message.content
      })
      
    } catch (apiError: any) {
      console.error("OpenAI API error:", apiError)
      return NextResponse.json(
        { 
          error: `OpenAI API error: ${apiError.message || "Unknown error"}`,
          details: apiError.response?.data || apiError
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      { error: "Error processing your request: " + (error.message || "Unknown error") },
      { status: 500 }
    )
  }
}
