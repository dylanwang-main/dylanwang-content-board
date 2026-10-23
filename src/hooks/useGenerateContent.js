import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useGenerateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input) => {
      try {
        const response = await base44.functions.invoke("generateContent", input);
        return response.data;
      } catch (error) {
        throw new Error(error?.response?.data?.error || "Generation failed. Please try again.");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content"] }),
  });
}