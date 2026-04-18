import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Чиний Prisma client хаана байгаагаас хамаарч замыг нь зөв заагаарай

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
);

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // 1. AI-аас Summary хүсэх
    const prompt = `Дараах текстийн товч утгыг (summary) монголоор гаргаж өгнө үү: ${content}`;
    const result = await model.generateContent(prompt);
    const summaryText = result.response.text();

    // 🔥 ХАМГААЛАЛТ: Summary хоосон бол алдаа буцаана
    if (!summaryText || summaryText.length < 10) {
      return NextResponse.json(
        { error: "AI товч утга үүсгэж чадсангүй. Та дахин оролдоно уу." },
        { status: 500 },
      );
    }

    // 2. DATABASE-д Хадгалах (Энэ бол гол зангилаа!)

    const newArticle = await db.article.create({
      data: {
        title: title,
        content: content,
        summary: summaryText.trim(), // Илүүдэл зайг арилгах
      },
    });

    // 3. Frontend-рүү хадгалагдсан датаг (ялангуяа ID-г нь) буцаах
    return NextResponse.json(newArticle);
  } catch (error) {
    console.error("Алдаа:", error);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
