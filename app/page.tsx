"use client";
import { useState, useEffect } from "react";

type Article = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
};

export default function QuizGenerator() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Sidebar-т article-уудыг татах
  const fetchArticles = async () => {
    const res = await fetch("/api/articles");
    const data = await res.json();
    setArticles(data);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await response.json();
      setSelectedArticle(data);
      fetchArticles(); // Sidebar шинэчлэх
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Алдаа:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-700">📚 Хадгалсан Articles</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {articles.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-4">
              Одоогоор article байхгүй
            </p>
          ) : (
            articles.map((article) => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className={`p-3 rounded-lg cursor-pointer border transition-all ${
                  selectedArticle?.id === article.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <p className="font-medium text-sm text-gray-800 truncate">
                  {article.title}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(article.createdAt).toLocaleDateString("mn-MN")}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Үндсэн хэсэг */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {selectedArticle ? (
          // Summary харуулах хэсэг
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl w-full">
            <button
              onClick={() => setSelectedArticle(null)}
              className="text-sm text-gray-400 hover:text-gray-600 mb-4"
            >
              ← Буцах
            </button>
            <h2 className="text-xl font-bold mb-4">{selectedArticle.title}</h2>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-700 mb-2">
                📝 Summary
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                {selectedArticle.summary}
              </p>
            </div>
          </div>
        ) : (
          // Article оруулах form
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl w-full">
            <div className="mb-6">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span>✨</span> Article Quiz Generator
              </h1>
              <p className="text-gray-500 mt-2">
                Paste your article below to generate a summary and quiz
                question.
              </p>
            </div>

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

            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={isLoading || !title || !content}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-8 rounded-lg transition-all disabled:opacity-50"
              >
                {isLoading ? "Generating..." : "Generate summary"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
