"use client";

import { TriviaSet } from "@/types/trivia";

interface TriviaListProps {
  triviaSets: TriviaSet[];
  loading: boolean;
}

export function TriviaList({ triviaSets, loading }: TriviaListProps) {
  if (loading) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <div className="text-gray-400">Loading trivia sets...</div>
      </div>
    );
  }

  if (triviaSets.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <div className="text-gray-400">
          <svg
            className="mx-auto h-12 w-12 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No trivia sets yet
          </h3>
          <p className="text-sm text-gray-500">
            Get started by creating your first trivia set
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {triviaSets.map((triviaSet) => (
        <div
          key={triviaSet._id}
          className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-lg text-gray-900">
              {triviaSet.name}
            </h3>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
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

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {triviaSet.description}
          </p>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">📂 {triviaSet.category}</span>
            <span className="text-gray-500">
              ❓ {triviaSet.questions.length} questions
            </span>
          </div>

          <div className="mt-4 pt-3 border-t flex gap-2">
            <button className="flex-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
              View
            </button>
            <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              Edit
            </button>
            <button className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
