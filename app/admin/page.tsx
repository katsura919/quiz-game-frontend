"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/adminContext";
import { Button } from "@/components/ui/button";
import { CreateTriviaDialog } from "@/components/CreateTriviaDialog";
import { TriviaList } from "@/components/TriviaList";
import { triviaApi } from "@/api/trivia";
import { TriviaSet } from "@/types/trivia";

export default function AdminPage() {
  const router = useRouter();
  const { admin, logout, isAuthenticated, loading } = useAdmin();
  const [triviaSets, setTriviaSets] = useState<TriviaSet[]>([]);
  const [loadingTrivia, setLoadingTrivia] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTriviaSets();
    }
  }, [isAuthenticated]);

  const fetchTriviaSets = async () => {
    try {
      setLoadingTrivia(true);
      const result = await triviaApi.getAllTriviaSets();
      if (result.success && result.data) {
        setTriviaSets(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch trivia sets:", error);
    } finally {
      setLoadingTrivia(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchTriviaSets();
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {admin?.name}
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              🚪 Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Trivia Sets</h2>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setCreateDialogOpen(true)}
            >
              ➕ Create New Trivia Set
            </Button>
          </div>

          <TriviaList triviaSets={triviaSets} loading={loadingTrivia} />
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-purple-500 text-white">
                  📝
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Trivia Sets
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {triviaSets.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-blue-500 text-white">
                  ❓
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Questions
                  {triviaSets.reduce(
                    (acc, set) => acc + set.questions.length,
                    0
                  )}
                </p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-green-500 text-white">
                  🎮
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Active Games
                </p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <CreateTriviaDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onSuccess={handleCreateSuccess}
          />
        </div>
      </main>
    </div>
  );
}
