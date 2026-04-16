import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Prisma-г олон дахин үүсгэхээс сэргийлсэн Singleton тохиргоо
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
);

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();

    // 1. AI-аас дата авах хэсэг
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      Чи бол багш. Дараах текстийг уншаад:
      Гарчиг: ${title}
      Агуулга: ${content}
      1. Текстийг монголоор товчил (summary).
      2. 4 асуулттай тест (quiz) зохио.
      Хариуг заавал JSON хэлбэрээр: {"summary": "...", "questions": [{"question": "...", "options": ["...", "..."], "answer": "..."}]}
    `;

    const result = await model.generateContent(prompt);
    const cleanText = result.response
      .text()
      .replace(/```json|```/g, "")
      .trim();
    const jsonStart = cleanText.indexOf("{");
    const jsonEnd = cleanText.lastIndexOf("}") + 1;
    const jsonData = JSON.parse(cleanText.substring(jsonStart, jsonEnd));

    console.log(jsonData);

    // 2. Өгөгдлийн санд хадгалах хэсэг
    // const savedArticle = await prisma.article.create({
    //   data: {
    //     title: title,
    //     content: content,
    //     summary: jsonData.summary,
    //     questions: {
    //       create: jsonData.questions.map((q: any) => ({
    //         question: q.question,
    //         options: q.options,
    //         answer: q.answer,
    //       })),
    //     },
    //   },
    //   include: {
    //     questions: true,
    //   },
    // });

    return NextResponse.json(savedArticle);
  } catch (error) {
    console.error("Алдаа:", error);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
