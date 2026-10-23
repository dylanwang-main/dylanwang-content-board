import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useContent() {
  return useQuery({
    queryKey: ["content"],
    queryFn: async () => {
      const page = await base44.entities.ContentItem.list({ sort: "-updated_date", limit: 500 });
      return page.items;
    },
  });
}

export function useBrand() {
  return useQuery({
    queryKey: ["brand"],
    queryFn: async () => {
      const page = await base44.entities.Brand.list({ sort: "-created_date", limit: 1 });
      return page.items[0] || null;
    },
  });
}

export function useSaveBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      id ? base44.entities.Brand.update(id, data) : base44.entities.Brand.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["brand"] }),
  });
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });
}

export function useSaveContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      id ? base44.entities.ContentItem.update(id, data) : base44.entities.ContentItem.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content"] }),
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => base44.entities.ContentItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content"] }),
  });
}