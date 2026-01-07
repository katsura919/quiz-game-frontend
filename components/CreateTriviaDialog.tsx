"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { triviaApi } from "@/api/trivia";
import { CreateTriviaSetData, Question } from "@/types/trivia";

interface CreateTriviaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTriviaDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTriviaDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<CreateTriviaSetData>({
    name: "",
    description: "",
    category: "",
    difficulty: "medium",
    questions: [],
    isPublic: true,
  });
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question: "",
    answers: ["", "", "", ""],
    correctAnswer: 0,
    timeLimit: 30,
    points: 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.questions.length === 0) {
      setError("Please add at least one question");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await triviaApi.createTriviaSet(formData);

      if (result.success) {
        onOpenChange(false);
        onSuccess();
        // Reset form
        setFormData({
          name: "",
          description: "",
          category: "",
          difficulty: "medium",
          questions: [],
          isPublic: true,
        });
        setCurrentQuestion({
          question: "",
          answers: ["", "", "", ""],
          correctAnswer: 0,
          timeLimit: 30,
          points: 100,
        });
      } else {
        setError(result.error || "Failed to create trivia set");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.question.trim()) {
      setError("Question text is required");
      return;
    }
    if (currentQuestion.answers.some((ans) => !ans.trim())) {
      setError("All answer options are required");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, currentQuestion],
    }));

    setCurrentQuestion({
      question: "",
      answers: ["", "", "", ""],
      correctAnswer: 0,
      timeLimit: 30,
      points: 100,
    });
    setError("");
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create New Trivia Set
          </DialogTitle>
          <DialogDescription>
            Fill in the details and add questions to create a new trivia set
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Basic Information</h3>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Trivia Set Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., General Knowledge Quiz"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your trivia set"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="e.g., Science, History"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="difficulty" className="text-sm font-medium">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      difficulty: e.target.value as "easy" | "medium" | "hard",
                    }))
                  }
                  className="w-full h-10 px-3 rounded-md border border-gray-300"
                  disabled={loading}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Questions ({formData.questions.length})
            </h3>

            {/* Added Questions List */}
            {formData.questions.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {formData.questions.map((q, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <span className="text-sm truncate flex-1">
                      {index + 1}. {q.question}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveQuestion(index)}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Question */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Add Question</h4>

              <div className="space-y-3">
                <Input
                  value={currentQuestion.question}
                  onChange={(e) =>
                    setCurrentQuestion((prev) => ({
                      ...prev,
                      question: e.target.value,
                    }))
                  }
                  placeholder="Enter question text"
                  disabled={loading}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Answer Options</label>
                  {currentQuestion.answers.map((answer, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={currentQuestion.correctAnswer === index}
                        onChange={() =>
                          setCurrentQuestion((prev) => ({
                            ...prev,
                            correctAnswer: index,
                          }))
                        }
                        disabled={loading}
                      />
                      <Input
                        value={answer}
                        onChange={(e) =>
                          setCurrentQuestion((prev) => ({
                            ...prev,
                            answers: prev.answers.map((a, i) =>
                              i === index ? e.target.value : a
                            ),
                          }))
                        }
                        placeholder={`Option ${index + 1}`}
                        disabled={loading}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Time Limit (seconds)
                    </label>
                    <Input
                      type="number"
                      value={currentQuestion.timeLimit}
                      onChange={(e) =>
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          timeLimit: parseInt(e.target.value) || 30,
                        }))
                      }
                      min={5}
                      max={120}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Points</label>
                    <Input
                      type="number"
                      value={currentQuestion.points}
                      onChange={(e) =>
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          points: parseInt(e.target.value) || 100,
                        }))
                      }
                      min={10}
                      max={1000}
                      step={10}
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleAddQuestion}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  ➕ Add Question
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Trivia Set"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
