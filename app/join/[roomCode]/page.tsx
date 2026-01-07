"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import socket from "@/lib/socket";

export default function JoinGamePage() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.roomCode as string;

  const [playerName, setPlayerName] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }

    // Listen for events
    socket.on("joined-game", handleJoinedGame);
    socket.on("error", handleError);

    return () => {
      socket.off("joined-game", handleJoinedGame);
      socket.off("error", handleError);
    };
  }, []);

  const handleJoinedGame = (data: { game: any }) => {
    console.log("Joined game:", data);
    // Navigate to player waiting room
    router.push(`/play/${roomCode}`);
  };

  const handleError = (error: { message: string }) => {
    setError(error.message);
    setJoining(false);
  };

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    setJoining(true);
    setError("");

    // Generate player ID
    const playerId = `player_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create player object
    const player = {
      id: playerId,
      name: playerName.trim(),
      score: 0,
      answeredQuestions: [],
    };

    // Emit join-game event
    socket.emit("join-game", {
      roomCode: roomCode.toUpperCase(),
      player,
    });

    // Store player data in localStorage
    localStorage.setItem("playerId", playerId);
    localStorage.setItem("playerName", playerName.trim());
    localStorage.setItem("currentRoomCode", roomCode.toUpperCase());
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-purple-600 via-blue-600 to-cyan-600 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              👥 Join Game
            </h1>
            <p className="text-gray-600 mb-4">
              Enter your name to join the game
            </p>

            {/* Room Code Display */}
            <div className="bg-linear-to-r from-purple-100 to-blue-100 rounded-lg py-3 px-4">
              <p className="text-sm text-gray-600 mb-1">Room Code</p>
              <p className="text-2xl font-bold text-purple-900 tracking-wider">
                {roomCode.toUpperCase()}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="playerName"
                className="block text-sm font-medium text-gray-700"
              >
                Your Name
              </label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                disabled={joining}
                className="text-lg h-14"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && playerName.trim()) {
                    handleJoinGame();
                  }
                }}
                autoFocus
              />
              <p className="text-xs text-gray-500">
                This is how other players will see you
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
                disabled={joining}
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinGame}
                className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={!playerName.trim() || joining}
              >
                {joining ? "Joining..." : "Join Game"}
              </Button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              Make sure you're entering the correct room code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
