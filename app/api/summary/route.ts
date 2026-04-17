import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
);

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // AI-аас Summary авах
    const prompt = `Дараах текстийн товч утгыг монголоор гарга: ${content}`;
    const result = await model.generateContent(prompt);
    const summaryText = result.response.text();

    // DATABASE-д хадгалах
    const newRecord = await db.article.create({
      data: {
        title: title,
        content: content,
        summary: summaryText,
      },
    });

    // Амжилттай болбол хадгалагдсан датаг буцаах
    return NextResponse.json(newRecord);
  } catch (error) {
    console.error("BackEnd Error:", error);
    return NextResponse.json(
      { error: "Датабэйст хадгалахад алдаа гарлаа" },
      { status: 500 },
    );
  }
}
