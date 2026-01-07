"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthDialog } from "@/components/auth-dialog";

export default function Home() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const handleCreateGame = () => {
    router.push("/create-room");
  };

  const handleJoinGame = () => {
    if (roomCode.trim()) {
      router.push(`/join/${roomCode.toUpperCase()}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-purple-600 via-blue-600 to-cyan-600">
      {/* Sign In Button */}
      <div className="absolute top-4 right-4">
        <Button
          onClick={() => setAuthDialogOpen(true)}
          variant="outline"
          className="bg-white/90 hover:bg-white"
        >
          🔐 Admin Sign In
        </Button>
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧠 Quiz Party
          </h1>
          <p className="text-gray-600">Real-time multiplayer trivia game</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleCreateGame}
            className="w-full h-14 text-lg font-semibold bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            🎮 Host a Game
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="h-14 text-lg text-center font-semibold tracking-wider"
              maxLength={6}
            />
            <Button
              onClick={handleJoinGame}
              variant="outline"
              className="w-full h-14 text-lg font-semibold"
              disabled={!roomCode.trim()}
            >
              👥 Join Game
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Play with friends in real-time</p>
          <p>No registration required</p>
        </div>
      </div>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
}
