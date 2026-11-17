import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/db";

const BRAIN_KEY = ["brain"];

export function useBrainFiles() {
  return useQuery({
    queryKey: BRAIN_KEY,
    queryFn: async () => {
      const page = await api.entities.BrainFile.list({ sort: "-created_date", limit: 500 });
      return page.items;
    },
  });
}

export function useUploadBrainFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ section, file }) => {
      const { file_uri } = await api.integrations.Core.UploadPrivateFile({ file });

      const record = await api.entities.BrainFile.create({
        section,
        file_name: file.name,
        file_uri,
        file_type: file.type,
        file_size: file.size,
        status: "learning",
      });

      api.functions
        .invoke("learnBrainFile", { file_id: record.id })
        .catch(() => {})
        .finally(() => queryClient.invalidateQueries({ queryKey: BRAIN_KEY }));

      return record;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BRAIN_KEY }),
  });
}

export function useRelearnBrainFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.entities.BrainFile.update(id, { status: "learning", error: "" });
      queryClient.invalidateQueries({ queryKey: BRAIN_KEY });

      api.functions
        .invoke("learnBrainFile", { file_id: id })
        .catch(() => {})
        .finally(() => queryClient.invalidateQueries({ queryKey: BRAIN_KEY }));
    },
  });
}

export function useDeleteBrainFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.entities.BrainFile.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BRAIN_KEY }),
  });
}