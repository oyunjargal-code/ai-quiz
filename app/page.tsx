"use client";
import { useState, useEffect } from "react";

// 1. ТӨРӨЛ ТӨДӨРХӨЙЛӨХ
type Question = {
  id: string;
  question: string;
  options: string[];
  answer: string;
};

type Article = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  questions: Question[];
};

export default function QuizGenerator() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Квиз төлөвүүд
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/articles");
      const data = await res.json();
      setArticles(data);
    } catch (error) {
      console.error("Дата татахад алдаа:", error);
    }
  };
  const onClick = () => {
    (setIsQuizStarted(false), setIsQuizCompleted(false));
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleGenerate = async () => {
    if (!title || !content) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await response.json();
      setSelectedArticle(data);
      fetchArticles();
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Алдаа:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedArticle?.id) return;
    setIsQuizLoading(true);
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: selectedArticle.id }),
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedArticle(data);
      }
    } finally {
      setIsQuizLoading(false);
    }
  };

  const startQuiz = () => {
    setIsQuizStarted(true);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setIsQuizCompleted(false);
  };

  const handleSelectAnswer = (selectedOption: string) => {
    const newAnswers = [...userAnswers, selectedOption];
    setUserAnswers(newAnswers);
    if (currentQuestionIndex + 1 < selectedArticle!.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      let score = 0;
      selectedArticle?.questions.forEach((q, index) => {
        if (q.answer === newAnswers[index]) score++;
      });
      setQuizScore(score);
      setIsQuizCompleted(true);
    }
  };

  // Харагдах байдлын нөхцөлүүд
  const isShowForm = !isLoading && !selectedArticle && !isQuizStarted;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200 font-bold text-gray-700">
          📚 Articles
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {articles.map((article) => (
            <div
              key={article.id}
              onClick={() => {
                setSelectedArticle(article);
                setIsQuizStarted(false);
                setIsQuizCompleted(false);
              }}
              className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedArticle?.id === article.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:bg-gray-50"}`}
            >
              <p className="font-medium text-sm text-gray-800 truncate">
                {article.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
        {/* 1. INPUT FORM - Одоо бүрэн гарч ирнэ */}
        {isShowForm && (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 max-w-2xl w-full">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold">✨ Article Quiz Generator</h1>
              <p className="text-gray-400 text-sm mt-2">
                Нийтлэлээ оруулаад AI-аар Summary болон Quiz бэлдүүлээрэй.
              </p>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
                Article Title
              </label>
              <input
                type="text"
                placeholder="Гарчиг оруулах..."
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
                Article Content
              </label>
              <textarea
                rows={6}
                placeholder="Нийтлэлийн агуулга..."
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-sm resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={isLoading || !title || !content}
                className="bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold py-3 px-10 rounded-lg text-xs uppercase tracking-widest transition-all"
              >
                {isLoading ? "Generating..." : "Generate summary"}
              </button>
            </div>
          </div>
        )}

        {/* 2. LOADING STATE */}
        {isLoading && (
          <div className="text-center p-10">Summary бэлдэж байна...</div>
        )}

        {/* 3. SUMMARY VIEW */}
        {selectedArticle && !isQuizStarted && !isQuizCompleted && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl w-full animate-in fade-in duration-500">
            <button
              onClick={() => setSelectedArticle(null)}
              className="text-sm text-gray-400 mb-6 flex items-center gap-1"
            >
              ‹ Буцах
            </button>
            <h2 className="text-xl font-bold mb-4">{selectedArticle.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              {selectedArticle.summary}
            </p>

            <div className="flex justify-between items-center pt-6 border-t border-gray-50">
              <button className="text-sm font-medium text-gray-400">
                See content
              </button>
              {selectedArticle.questions &&
              selectedArticle.questions.length > 0 ? (
                <button
                  onClick={startQuiz}
                  className="bg-black text-white text-xs font-bold px-8 py-2.5 rounded-md hover:bg-gray-800 transition-all"
                >
                  Take a test
                </button>
              ) : (
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isQuizLoading}
                  className="bg-black text-white text-xs font-bold px-8 py-2.5 rounded-md"
                >
                  {isQuizLoading ? "Generating Quiz..." : "Take a quiz"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 4. QUIZ MODE (Figma-ийн дагуу) */}
        {isQuizStarted && !isQuizCompleted && selectedArticle && (
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
              <h2 className="text-2xl font-bold text-gray-800">Quick test</h2>
              <div className="text-gray-400 font-bold text-sm bg-gray-50 px-4 py-2 rounded-full">
                {currentQuestionIndex + 1} / {selectedArticle.questions.length}
              </div>
            </div>
            <p className="font-semibold text-gray-800 mb-8">
              {selectedArticle.questions[currentQuestionIndex].question}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {selectedArticle.questions[currentQuestionIndex].options.map(
                (opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectAnswer(opt)}
                    className="text-left text-sm bg-white p-5 rounded-2xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all font-medium text-gray-700"
                  >
                    {opt}
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        {/* 5. RESULT MODE (Figma-ийн дагуу) */}
        {isQuizCompleted && selectedArticle && (
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800">
                Quiz completed
              </h2>
            </div>
            <div className="bg-gray-50 p-8 rounded-3xl mb-10">
              <div className="font-bold text-sm mb-6 uppercase text-gray-400 tracking-widest">
                Your score:{" "}
                <span className="text-gray-800 text-2xl ml-2">
                  {quizScore} / {selectedArticle.questions.length}
                </span>
              </div>
              <div className="space-y-4">
                {selectedArticle.questions.map((q, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl bg-white border ${userAnswers[i] === q.answer ? "border-green-100" : "border-red-100"}`}
                  >
                    <p className="text-sm font-bold mb-2">
                      {i + 1}. {q.question}
                    </p>
                    <p
                      className={`text-xs ${userAnswers[i] === q.answer ? "text-green-600" : "text-red-500"}`}
                    >
                      Чиний хариулт: {userAnswers[i]}
                    </p>
                    {userAnswers[i] !== q.answer && (
                      <p className="text-xs text-green-600 mt-1">
                        Зөв хариулт: {q.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={onClick}
              className="w-full bg-black text-white py-4 rounded-xl font-bold"
            >
              Save and back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
