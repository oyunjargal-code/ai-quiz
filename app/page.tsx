"use client";
import { useState } from "react";

export default function QuizGenerator() {
  // Input-үүдийн утгыг хадгалах State-үүд
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Товчлуур дарах үед ажиллах функц
  const handleGenerate = async () => {
    if (!title || !content) return alert("Гарчиг болон агуулгыг оруулна уу!");

    setIsLoading(true);
    try {
      // Энд хоёулаа дараа нь Backend-ээ холбоно
      const response = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ title, content }),
      });
      const data = await response.json();
      console.log("AI-аас ирсэн дата:", data);
    } catch (error) {
      console.error("Алдаа гарлаа:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl w-full">
        {/* Толгой хэсэг */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>✨</span> Article Quiz Generator
          </h1>
          <p className="text-gray-500 mt-2">
            Paste your article below to generate a summarize and quiz question.
            Your articles will saved in the sidebar for future reference.
          </p>
        </div>

        {/* Article Title Input */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            📄 Article Title
          </label>
          <input
            type="text"
            placeholder="Enter a title for your article..."
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Article Content Input */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            📑 Article Content
          </label>
          <textarea
            rows={6}
            placeholder="Paste your article content here..."
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-8 rounded-lg transition-all disabled:opacity-50"
          >
            {isLoading ? "Generating..." : "Generate summary"}
          </button>
        </div>
      </div>
    </div>
  );
}
