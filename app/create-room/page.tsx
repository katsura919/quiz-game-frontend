"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { triviaApi } from "@/api/trivia";
import { TriviaSet } from "@/types/trivia";
import socket from "@/lib/socket";

export default function CreateRoomPage() {
  const router = useRouter();
  const [triviaSets, setTriviaSets] = useState<TriviaSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTriviaSet, setSelectedTriviaSet] = useState<string>("");
  const [hostName, setHostName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTriviaSets();
  }, []);

  useEffect(() => {
    // Connect socket
    if (!socket.connected) {
      socket.connect();
    }

    // Listen for game created event
    socket.on("game-created", handleGameCreated);
    socket.on("error", handleError);

    return () => {
      socket.off("game-created", handleGameCreated);
      socket.off("error", handleError);
    };
  }, []);

  const fetchTriviaSets = async () => {
    try {
      setLoading(true);
      const result = await triviaApi.getAllTriviaSets();
      if (result.success && result.data) {
        setTriviaSets(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch trivia sets:", error);
      setError("Failed to load trivia sets");
    } finally {
      setLoading(false);
    }
  };

  const handleGameCreated = (data: { roomCode: string; game: any }) => {
    console.log("Game created:", data);

    // Get host info from localStorage
    const hostId = localStorage.getItem("hostId");
    const hostName = localStorage.getItem("hostName");

    if (!hostId || !hostName) return;

    // Join as a player
    socket.emit("join-game", {
      roomCode: data.roomCode,
      player: {
        id: hostId,
        name: hostName,
        score: 0,
      },
    });

    // Navigate to host waiting room
    router.push(`/host/${data.roomCode}`);
  };

  const handleError = (error: { message: string }) => {
    setError(error.message);
    setCreating(false);
  };

  const handleCreateRoom = () => {
    if (!hostName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!selectedTriviaSet) {
      setError("Please select a trivia set");
      return;
    }

    const triviaSet = triviaSets.find((set) => set._id === selectedTriviaSet);
    if (!triviaSet) {
      setError("Invalid trivia set selected");
      return;
    }

    setCreating(true);
    setError("");

    // Generate host ID
    const hostId = `host_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Format questions for the game
    const questions = triviaSet.questions.map((q, index) => ({
      id: `q_${index}`,
      question: q.question,
      answers: q.answers,
      correctAnswer: q.correctAnswer,
      timeLimit: q.timeLimit,
      points: q.points,
    }));

    // Emit create-game event
    socket.emit("create-game", {
      hostId,
      questions,
    });

    // Store host data in localStorage
    localStorage.setItem("hostId", hostId);
    localStorage.setItem("hostName", hostName.trim());
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-purple-600 via-blue-600 to-cyan-600">
        <div className="text-white text-xl">Loading trivia sets...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-purple-600 via-blue-600 to-cyan-600 p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎮 Create Game Room
            </h1>
            <p className="text-gray-600">
              Select a trivia set to start hosting
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {triviaSets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                No trivia sets available. Please create one first.
              </p>
              <Button
                onClick={() => router.push("/admin")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Go to Admin Panel
              </Button>
            </div>
          ) : (
            <>
              {/* Host Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <Input
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  disabled={creating}
                  className="text-lg"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Trivia Set
                </label>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {triviaSets.map((triviaSet) => (
                    <div
                      key={triviaSet._id}
                      onClick={() => setSelectedTriviaSet(triviaSet._id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTriviaSet === triviaSet._id
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {triviaSet.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {triviaSet.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              📂 {triviaSet.category}
                            </span>
                            <span className="flex items-center gap-1">
                              ❓ {triviaSet.questions.length} questions
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full ${
                                triviaSet.difficulty === "easy"
                                  ? "bg-green-100 text-green-800"
                                  : triviaSet.difficulty === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {triviaSet.difficulty}
                            </span>
                          </div>
                        </div>
                        {selectedTriviaSet === triviaSet._id && (
                          <div className="ml-4 text-purple-600">
                            <svg
                              className="w-6 h-6"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="flex-1"
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRoom}
                  className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={!selectedTriviaSet || !hostName.trim() || creating}
                >
                  {creating ? "Creating Room..." : "Create Room"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
