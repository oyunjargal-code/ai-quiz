import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Gemini-г тохируулах
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
);

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();

    // 2. Моделио сонгох (gemini-1.5-flash нь маш хурдан)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Чи бол боловсролын туслах.
      Гарчиг: ${title}
      Агуулга: ${content}
      
      Дээрх текст дээр үндэслэн:
      1. Нийтлэлийн товч утгыг (summary) монголоор гарга.
      2. Тексттэй холбоотой 3 асуулт бүхий тест (quiz) зохио.
      
      ХАРИУГ ЗААВАЛ ИЙМ JSON ФОРМАТААР БУЦАА:
      {
        "summary": "товч утга энд",
        "questions": [
          { "question": "асуулт 1", "options": ["хувилбар 1", "2", "3"], "answer": "зөв хариулт" }
        ]
      }
    `;

    // 3. AI-аас хариу авах
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // AI-ийн хариунаас JSON-ийг салгаж авах (заримдаа AI илүү текст өгчихдөг)
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;
    const jsonData = JSON.parse(text.substring(jsonStart, jsonEnd));

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      { error: "AI ажиллахад алдаа гарлаа" },
      { status: 500 },
    );
  }
}
