import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "OPENAI_API_KEY environment variable is not set"
      }, { status: 400 });
    }

    // Check if API key looks correct
    if (!apiKey.startsWith('sk-') && !apiKey.startsWith('sk-proj-')) {
      return NextResponse.json({
        success: false,
        error: "API key doesn't have the expected format (should start with 'sk-' or 'sk-proj-')"
      }, { status: 400 });
    }
    
    // Try a simple models list request first (doesn't consume tokens)
    let modelsResponse;
    try {
      modelsResponse = await axios.get("https://api.openai.com/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      });
    } catch (modelsError: any) {
      return NextResponse.json({
        success: false,
        error: "Failed to list models",
        details: modelsError.message || modelsError,
        response: modelsError.response?.data || null
      }, { status: 500 });
    }
    
    // Try a simple chat completion
    let chatResponse;
    try {
      chatResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 5
        },
        {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );
    } catch (chatError: any) {
      return NextResponse.json({
        success: false,
        error: "Failed to create chat completion",
        details: chatError.message || chatError,
        response: chatError.response?.data || null,
        models: modelsResponse.data || null
      }, { status: 500 });
    }
    
    // All checks passed
    return NextResponse.json({
      success: true,
      apiKeyFormat: "Valid",
      modelsAvailable: modelsResponse.data.length,
      sampleModels: modelsResponse.data.slice(0, 3).map((m: any) => m.id),
      chatCompletionWorks: true,
      sampleResponse: chatResponse.data.choices[0].message.content
    });
  } catch (error: any) {
    console.error("Troubleshooting failed:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error during troubleshooting",
      stack: error.stack
    }, { status: 500 });
  }
}
