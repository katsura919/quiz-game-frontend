export interface Player {
  id: string;
  name: string;
  score: number;
  avatar?: string;
  answeredQuestions: string[];
}

export interface Question {
  id: string;
  question: string;
  answers: string[];
  timeLimit: number;
  questionNumber?: number;
  totalQuestions?: number;
}

export interface Game {
  roomCode: string;
  hostId: string;
  status: "waiting" | "playing" | "finished";
  players: Player[];
  currentQuestionIndex: number;
  questions: Question[];
}
