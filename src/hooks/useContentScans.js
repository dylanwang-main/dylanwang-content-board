import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const KEY = ["contentScans"];

export function useContentScans() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const page = await base44.entities.ContentScan.list({ sort: "-created_date", limit: 50 });
      return page.items;
    },
    refetchInterval: (query) =>
      (query.state.data || []).some((scan) => scan.status === "scanning") ? 5000 : false,
  });
}

export function useRunContentScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input) => {
      const record = await base44.entities.ContentScan.create({ ...input, status: "scanning" });

      base44.functions
        .invoke("scanContent", { scan_id: record.id })
        .catch(() => {})
        .finally(() => queryClient.invalidateQueries({ queryKey: KEY }));

      return record;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteContentScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => base44.entities.ContentScan.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}