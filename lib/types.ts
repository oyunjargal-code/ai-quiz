export type Question = {
  id: string;
  question: string;
  options: string[];
  answer: string;
};

export type Article = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  questions: Question[];
};
