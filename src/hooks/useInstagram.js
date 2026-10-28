import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useInstagramMedia() {
  return useQuery({
    queryKey: ["instagram"],
    queryFn: async () => {
      const page = await base44.entities.InstagramMedia.list({
        sort: "-timestamp",
        limit: 200,
      });
      return page.items;
    },
    refetchInterval: (query) =>
      (query.state.data || []).some((item) => item.status === "analyzing") ? 5000 : false,
  });
}

export function useSyncInstagram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const response = await base44.functions.invoke("syncInstagramMedia", {});
        return response.data;
      } catch (error) {
        throw new Error(
          error?.response?.data?.error || error?.message || "Instagram sync failed. Please try again."
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instagram"] });
      queryClient.invalidateQueries({ queryKey: ["social-accounts"] });
    },
  });
}

export function useAnalyzeInstagramMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaId) => {
      await base44.entities.InstagramMedia.update(mediaId, { status: "analyzing" });
      queryClient.invalidateQueries({ queryKey: ["instagram"] });

      base44.functions
        .invoke("analyzeInstagramVideo", { media_id: mediaId })
        .catch(() => {})
        .finally(() => queryClient.invalidateQueries({ queryKey: ["instagram"] }));

      return mediaId;
    },
  });
}

export function useDeleteInstagramMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => base44.entities.InstagramMedia.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instagram"] }),
  });
}