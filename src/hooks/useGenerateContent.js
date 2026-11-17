import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/db";

export function useGenerateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input) => {
      try {
        const response = await api.functions.invoke("generateContent", input);
        return response.data;
      } catch (error) {
        throw new Error(error?.response?.data?.error || "Generation failed. Please try again.");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content"] }),
  });
}