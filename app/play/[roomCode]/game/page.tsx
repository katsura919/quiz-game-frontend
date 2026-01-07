"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/lib/SocketContext";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  timeLimit: number;
}

interface Player {
  id: string;
  name: string;
  score: number;
}

export default function PlayerGamePage() {
  const params = useParams();
  const router = useRouter();
  const socket = useSocket();
  const roomCode = params.roomCode as string;

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [score, setScore] = useState<number>(0);
  const [questionNumber, setQuestionNumber] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [playerName, setPlayerName] = useState<string>("");

  useEffect(() => {
    const storedPlayerName =
      localStorage.getItem("playerName") || localStorage.getItem("hostName");
    if (!storedPlayerName) {
      router.push(`/join/${roomCode}`);
      return;
    }
    setPlayerName(storedPlayerName);
  }, [roomCode, router]);

  useEffect(() => {
    if (!socket) {
      console.log("Socket not available");
      return;
    }

    console.log("Setting up socket listeners for room:", roomCode);
    console.log("Socket connected:", socket.connected);
    console.log("Current socket ID:", socket.id);

    // Ensure we're in the room (re-join if needed)
    const playerId =
      localStorage.getItem("playerId") || localStorage.getItem("hostId");
    const playerName =
      localStorage.getItem("playerName") || localStorage.getItem("hostName");

    if (playerId && playerName) {
      console.log("Ensuring player is in room:", {
        roomCode,
        playerId,
        playerName,
      });
      // Request current game state since we might have missed the game-started event
      socket.emit("get-current-question", { roomCode, playerId });
    }

    // Listen for current question response
    socket.on("current-question", (data: any) => {
      console.log("Received current-question:", data);
      if (data && data.question) {
        const questionData = data.question;
        setCurrentQuestion({
          id: questionData.id,
          question: questionData.question,
          answers: questionData.answers,
          correctAnswer: questionData.correctAnswer,
          timeLimit: questionData.timeLimit,
        });
        setQuestionNumber(questionData.questionNumber);
        setTotalQuestions(questionData.totalQuestions);
        setTimeLeft(questionData.timeLimit || 30);
        setSelectedAnswer(null);
        setHasSubmitted(false);
        setIsCorrect(null);
      }
    });

    // Listen for game started (first question)
    socket.on("game-started", (data: any) => {
      console.log("Received game-started:", data);
      if (!data || !data.question) {
        console.error("Invalid game-started data:", data);
        return;
      }
      const questionData = data.question;
      setCurrentQuestion({
        id: questionData.id,
        question: questionData.question,
        answers: questionData.answers,
        correctAnswer: questionData.correctAnswer,
        timeLimit: questionData.timeLimit,
      });
      setQuestionNumber(questionData.questionNumber);
      setTotalQuestions(questionData.totalQuestions);
      setTimeLeft(questionData.timeLimit || 30);
      setSelectedAnswer(null);
      setHasSubmitted(false);
      setIsCorrect(null);
    });

    // Listen for next question
    socket.on("next-question", (data: any) => {
      console.log("Received next-question:", data);
      const questionData = data.question;
      setCurrentQuestion({
        id: questionData.id,
        question: questionData.question,
        answers: questionData.answers,
        correctAnswer: questionData.correctAnswer,
        timeLimit: questionData.timeLimit,
      });
      setQuestionNumber(questionData.questionNumber);
      setTotalQuestions(questionData.totalQuestions);
      setTimeLeft(questionData.timeLimit || 30);
      setSelectedAnswer(null);
      setHasSubmitted(false);
      setIsCorrect(null);
    });

    // Listen for answer result
    socket.on("answer-result", (data: { correct: boolean; points: number }) => {
      setIsCorrect(data.correct);
      setScore((prev) => prev + data.points);
    });

    // Listen for game finished
    socket.on("game-finished", () => {
      router.push(`/play/${roomCode}/leaderboard`);
    });

    // Listen for errors
    socket.on("error", (data: { message: string }) => {
      console.error("Socket error:", data.message);
      alert(data.message);
    });

    return () => {
      socket.off("current-question");
      socket.off("game-started");
      socket.off("next-question");
      socket.off("answer-result");
      socket.off("game-finished");
      socket.off("error");
    };
  }, [socket, roomCode, router]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, hasSubmitted]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (hasSubmitted) return;

    setSelectedAnswer(answerIndex);
    setHasSubmitted(true);

    const playerId =
      localStorage.getItem("playerId") || localStorage.getItem("hostId");
    if (!socket || !playerId) return;

    // Auto-submit immediately
    socket.emit("submit-answer", {
      roomCode,
      playerId,
      answerIndex: answerIndex,
    });
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Waiting for next question...</p>
        </div>
      </div>
    );
  }

  const getAnswerClassName = (index: number) => {
    const baseClasses =
      "w-full p-6 text-left text-lg font-medium rounded-lg transition-all duration-200 ";

    if (!hasSubmitted) {
      if (selectedAnswer === index) {
        return baseClasses + "bg-blue-500 text-white scale-105 shadow-lg";
      }
      return (
        baseClasses + "bg-white text-gray-800 hover:bg-blue-100 hover:scale-102"
      );
    }

    // After submission
    if (isCorrect !== null) {
      if (index === currentQuestion.correctAnswer) {
        return baseClasses + "bg-green-500 text-white shadow-lg";
      }
      if (selectedAnswer === index && !isCorrect) {
        return baseClasses + "bg-red-500 text-white shadow-lg";
      }
    }

    return baseClasses + "bg-gray-300 text-gray-600 cursor-not-allowed";
  };

  const getTimerColor = () => {
    if (timeLeft > 15) return "text-green-400";
    if (timeLeft > 5) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 flex justify-between items-center">
          <div className="text-white">
            <p className="text-sm opacity-80">Player</p>
            <p className="text-xl font-bold">{playerName}</p>
          </div>
          <div className="text-white text-center">
            <p className="text-sm opacity-80">Question</p>
            <p className="text-xl font-bold">
              {questionNumber} / {totalQuestions}
            </p>
          </div>
          <div className="text-white text-center">
            <p className="text-sm opacity-80">Score</p>
            <p className="text-xl font-bold">{score}</p>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center">
            <div className={`text-6xl font-bold ${getTimerColor()}`}>
              {timeLeft}
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft > 15
                  ? "bg-green-400"
                  : timeLeft > 5
                  ? "bg-yellow-400"
                  : "bg-red-400"
              }`}
              style={{
                width: `${
                  (timeLeft / (currentQuestion.timeLimit || 30)) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg p-8 mb-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {currentQuestion.question}
          </h2>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={hasSubmitted}
                className={getAnswerClassName(index)}
              >
                <span className="font-bold mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                {answer}
              </button>
            ))}
          </div>
        </div>

        {/* Result Message */}
        {hasSubmitted && isCorrect !== null && (
          <div className="text-center">
            <div
              className={`inline-block px-8 py-4 rounded-lg text-white text-xl font-bold ${
                isCorrect ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {isCorrect ? "✓ Correct!" : "✗ Wrong Answer"}
            </div>
            <p className="text-white mt-4 text-lg">
              Waiting for next question...
            </p>
          </div>
        )}

        {hasSubmitted && isCorrect === null && (
          <div className="text-center">
            <p className="text-white text-lg">
              Answer submitted! Waiting for results...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
