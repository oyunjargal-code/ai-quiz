// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";

// export async function GET() {
//   try {
//     const articles = await db.article.findMany({
//       orderBy: { createdAt: "desc" },
//       select: {
//         id: true,
//         title: true,
//         summary: true,
//         createdAt: true,
//       },
//     });
//     return NextResponse.json(articles);
//   } catch (error) {
//     console.error("Алдаа:", error);
//     return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const articles = await db.article.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        summary: true,
        createdAt: true,
      },
    });
    return NextResponse.json(articles);
  } catch (error) {
    console.error("Алдаа:", error);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
