import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const KEY = ["research"];

export function useResearchList() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const page = await base44.entities.Research.list({ sort: "-created_date", limit: 50 });
      return page.items;
    },
    refetchInterval: (query) =>
      (query.state.data || []).some((row) => row.status === "researching") ? 5000 : false,
  });
}

export function useRunResearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input) => {
      const record = await base44.entities.Research.create({ ...input, status: "researching" });

      base44.functions
        .invoke("runResearch", { research_id: record.id })
        .catch(() => {})
        .finally(() => queryClient.invalidateQueries({ queryKey: KEY }));

      return record;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteResearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => base44.entities.Research.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}