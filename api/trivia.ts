import api from "@/utils/api";
import { TriviaSetListResponse, TriviaSetResponse, CreateTriviaSetData } from "@/types/trivia";

export const triviaApi = {
  // Get all trivia sets
  getAllTriviaSets: async (): Promise<TriviaSetListResponse> => {
    const response = await api.get<TriviaSetListResponse>("/api/trivia-sets");
    return response.data;
  },

  // Get trivia set by ID
  getTriviaSetById: async (id: string): Promise<TriviaSetResponse> => {
    const response = await api.get<TriviaSetResponse>(`/api/trivia-sets/${id}`);
    return response.data;
  },

  // Create new trivia set
  createTriviaSet: async (
    data: CreateTriviaSetData
  ): Promise<TriviaSetResponse> => {
    const response = await api.post<TriviaSetResponse>(
      "/api/trivia-sets",
      data
    );
    return response.data;
  },
};
