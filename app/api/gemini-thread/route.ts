import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const prompt = await req.json();

    const finalPrompt = `
You are a thread-writing assistant.

The user wants a social media thread based on their prompt.

User prompt:
"""${prompt}"""

Your job:
- Create a short post using the prompt.
- Each post must be short, clean and consize.
- The writing style should match the user's intention.
- DO NOT write explanations or anything extra.
- Return output in the form of strings.

Example of correct output: YOUR OUTPUT
    `;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${finalPrompt}`,
    });

    console.log("Response text: ", response.text);
    return NextResponse.json({
      text: response.text,
    });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
