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

export default function HostWaitingRoom() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.roomCode as string;

  const [players, setPlayers] = useState<Player[]>([]);
  const [hostId, setHostId] = useState("");
  const [hostName, setHostName] = useState("");
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    // Get host data from localStorage
    const storedHostId = localStorage.getItem("hostId");
    const storedHostName = localStorage.getItem("hostName");

    if (storedHostId && storedHostName) {
      setHostId(storedHostId);
      setHostName(storedHostName);
    } else {
      // If no host data, redirect to home
      router.push("/");
      return;
    }

    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }

    // Listen for player joined events
    socket.on("player-joined", handlePlayerJoined);
    socket.on("player-left", handlePlayerLeft);
    socket.on("game-started", handleGameStarted);
    socket.on("error", handleError);

    return () => {
      socket.off("player-joined", handlePlayerJoined);
      socket.off("player-left", handlePlayerLeft);
      socket.off("game-started", handleGameStarted);
      socket.off("error", handleError);
    };
  }, [roomCode, router]);

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
    // Navigate to game screen
    router.push(`/play/${roomCode}/game`);
  };

  const handleError = (error: { message: string }) => {
    console.error("Socket error:", error);
    alert(error.message);
    setStarting(false);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleStartGame = () => {
    if (players.length === 0) {
      alert("Wait for at least one player to join!");
      return;
    }

    setStarting(true);
    socket.emit("start-game", { roomCode });
  };

  const handleCancel = () => {
    // Emit leave game or cleanup
    socket.disconnect();
    localStorage.removeItem("hostId");
    router.push("/");
  };

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${roomCode}`
      : "";

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-blue-600 to-cyan-600 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Room Code Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🎮 Game Room Ready!
            </h1>
            <p className="text-gray-600">
              Share this code with players to join
            </p>
          </div>

          <div className="bg-linear-to-r from-purple-100 to-blue-100 rounded-2xl p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Room Code</p>
              <div className="text-5xl font-bold text-purple-900 tracking-wider mb-4">
                {roomCode}
              </div>
              <Button
                onClick={handleCopyCode}
                variant="outline"
                className="bg-white"
              >
                {copied ? "✓ Copied!" : "📋 Copy Code"}
              </Button>
            </div>
          </div>

          {/* Share Link */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Or share this link:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                variant="outline"
                size="sm"
              >
                Copy
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              disabled={starting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartGame}
              className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={players.length === 0 || starting}
            >
              {starting ? "Starting..." : `Start Game (${players.length + 1})`}
            </Button>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Players ({players.length})
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">
                Waiting for players...
              </span>
            </div>
          </div>

          {players.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-500 text-lg">
                No players yet. Share the code to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-linear-to-br from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {player.avatar || player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {player.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Player #{index + 1}
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {players.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                💡 Tip: Wait for all players to join before starting the game
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
