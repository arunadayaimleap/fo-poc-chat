import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    // Test with a simple chat completion using axios
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: "Say hello" }
        ],
        max_tokens: 50,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return NextResponse.json({
      success: true,
      content: response.data.choices[0].message.content,
      message: "API key is working correctly"
    });
  } catch (error: any) {
    console.error("OpenAI API test failed:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error",
      details: error.response?.data || error,
      message: "API key may be invalid or expired"
    }, { status: 500 });
  }
}
