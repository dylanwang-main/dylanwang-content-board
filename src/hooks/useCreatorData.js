import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/db";

export function useContent() {
  return useQuery({
    queryKey: ["content"],
    queryFn: async () => {
      const page = await api.entities.ContentItem.list({ sort: "-updated_date", limit: 500 });
      return page.items;
    },
  });
}

export function useBrand() {
  return useQuery({
    queryKey: ["brand"],
    queryFn: async () => {
      const page = await api.entities.Brand.list({ sort: "-created_date", limit: 1 });
      return page.items[0] || null;
    },
  });
}

export function useSaveBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      id ? api.entities.Brand.update(id, data) : api.entities.Brand.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["brand"] }),
  });
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.auth.me(),
  });
}

export function useSaveMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.auth.updateMe(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useSaveContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      id ? api.entities.ContentItem.update(id, data) : api.entities.ContentItem.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content"] }),
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.entities.ContentItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content"] }),
  });
}