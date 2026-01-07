"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import socket from "@/lib/socket";

interface Player {
  id: string;
  name: string;
  score: number;
  avatar?: string;
}

interface Game {
  roomCode: string;
  hostId: string;
  status: string;
  players: Player[];
}

export default function PlayerWaitingRoom() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.roomCode as string;

  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    // Get player data from localStorage
    const storedPlayerId = localStorage.getItem("playerId");
    const storedPlayerName = localStorage.getItem("playerName");

    if (storedPlayerId && storedPlayerName) {
      setPlayerId(storedPlayerId);
      setPlayerName(storedPlayerName);
    } else {
      // If no player data, redirect to join page
      router.push(`/join/${roomCode}`);
      return;
    }

    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }

    // Listen for socket events
    socket.on("joined-game", handleJoinedGame);
    socket.on("player-joined", handlePlayerJoined);
    socket.on("player-left", handlePlayerLeft);
    socket.on("game-started", handleGameStarted);
    socket.on("error", handleError);

    return () => {
      socket.off("joined-game", handleJoinedGame);
      socket.off("player-joined", handlePlayerJoined);
      socket.off("player-left", handlePlayerLeft);
      socket.off("game-started", handleGameStarted);
      socket.off("error", handleError);
    };
  }, [roomCode, router]);

  const handleJoinedGame = (data: { game: Game }) => {
    console.log("Joined game:", data);
    setGame(data.game);
    setPlayers(data.game.players);
  };

  const handlePlayerJoined = (data: { player: Player; players: Player[] }) => {
    console.log("Player joined:", data);
    setPlayers(data.players);
  };

  const handlePlayerLeft = (data: { playerId: string; players: Player[] }) => {
    console.log("Player left:", data);
    setPlayers(data.players);
  };

  const handleGameStarted = (data: { game: any; question: any }) => {
    console.log("Game started:", data);
    // Navigate to game play screen
    router.push(`/play/${roomCode}/game`);
  };

  const handleError = (error: { message: string }) => {
    console.error("Socket error:", error);
    alert(error.message);
  };

  const handleLeaveGame = () => {
    socket.emit("leave-game", {
      roomCode,
      playerId,
    });

    localStorage.removeItem("playerId");
    localStorage.removeItem("playerName");
    localStorage.removeItem("currentRoomCode");
    socket.disconnect();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-blue-600 to-cyan-600 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Room Info Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🎮 Waiting for Game to Start
            </h1>
            <p className="text-gray-600">The host will start the game soon</p>
          </div>

          <div className="bg-linear-to-r from-purple-100 to-blue-100 rounded-2xl p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Room Code</p>
              <div className="text-4xl font-bold text-purple-900 tracking-wider mb-3">
                {roomCode}
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Connected</span>
              </div>
            </div>
          </div>

          {/* Your Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {playerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{playerName}</div>
                <div className="text-xs text-blue-600 font-medium">You</div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>

          <Button
            onClick={handleLeaveGame}
            variant="outline"
            className="w-full"
          >
            Leave Game
          </Button>
        </div>

        {/* Players List */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Players in Room ({players.length + 1})
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Waiting for host...</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Host Card (if we can identify them) */}
            {game?.hostId && (
              <div className="bg-linear-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-300">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    H
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Host</div>
                    <div className="text-xs text-yellow-600 font-medium">
                      👑 Game Host
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            )}

            {/* Player Cards */}
            {players.map((player, index) => {
              const isCurrentPlayer = player.id === playerId;
              return (
                <div
                  key={player.id}
                  className={`rounded-lg p-4 border-2 ${
                    isCurrentPlayer
                      ? "bg-linear-to-br from-blue-50 to-cyan-50 border-blue-300"
                      : "bg-linear-to-br from-purple-50 to-blue-50 border-purple-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        isCurrentPlayer
                          ? "bg-linear-to-br from-blue-500 to-cyan-500"
                          : "bg-linear-to-br from-purple-500 to-blue-500"
                      }`}
                    >
                      {player.avatar || player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {player.name}
                        {isCurrentPlayer && " (You)"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Player #{index + 1}
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                <p className="text-sm text-yellow-800 font-medium">
                  Waiting for host to start the game...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
