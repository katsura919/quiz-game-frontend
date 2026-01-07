export interface Question {
  question: string;
  answers: string[];
  correctAnswer: number;
  timeLimit: number;
  points: number;
}

export interface TriviaSet {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  questions: Question[];
  createdBy?: string;
  isPublic: boolean;
  createdAt: string;
}

export interface CreateTriviaSetData {
  name: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  questions: Question[];
  isPublic?: boolean;
}

export interface TriviaSetResponse {
  success: boolean;
  data?: TriviaSet;
  error?: string;
}

export interface TriviaSetListResponse {
  success: boolean;
  data?: TriviaSet[];
  error?: string;
}
