import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY as string,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { error: "Gemini API error", details: errorData },
        { status: res.status }
      );
    }

    const data = await res.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply from AI.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
