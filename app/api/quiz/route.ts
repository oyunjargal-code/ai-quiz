import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
);

export async function POST(req: Request) {
  try {
    const { articleId } = await req.json();

    // 1. Датабэйсээс article-г шалгах
    const article = await db.article.findUnique({
      where: { id: articleId },
    });

    if (!article || !article.summary) {
      return NextResponse.json({ error: "Summary олдсонгүй" }, { status: 404 });
    }

    // 🔥 МОДЕЛИЙН НЭРИЙГ ЗАСАВ: gemini-1.5-flash бол хамгийн тогтвортой нь
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // 2. AI-д зориулсан заавар
    const prompt = `
      Дараах товч утга (summary) дээр үндэслэн 3 асуулт бүхий тест (quiz) зохио.
      Асуулт болон хариултууд нь заавал монгол хэл дээр байх ёстой.
      
      Summary: ${article.summary}
      
      ХАРИУГ ЗААВАЛ ИЙМ JSON ФОРМАТААР БУЦАА (өөр нэмэлт тайлбар битгий бич):
      {
        "questions": [
          { 
            "question": "асуулт...", 
            "options": ["хариулт 1", "хариулт 2", "хариулт 3", "хариулт 4"], 
            "answer": "зөв хариулт" 
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // JSON хэсгийг цэвэрлэж авах (Markdown tag-уудыг арилгах)
    const jsonString = responseText.replace(/```json|```/gi, "").trim();
    const quizData = JSON.parse(jsonString);

    // 3. Датабэйс рүү хадгалах
    // 'include' ашигласнаар шинэчлэгдсэн асуултуудыг хамт буцаана
    const updatedArticle = await db.article.update({
      where: { id: articleId },
      data: {
        questions: {
          create: quizData.questions.map((q: any) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json(updatedArticle);
  } catch (error: any) {
    console.error("Quiz API Error:", error);
    return NextResponse.json(
      { error: error.message || "Квиз үүсгэхэд алдаа гарлаа" },
      { status: 500 },
    );
  }
}
