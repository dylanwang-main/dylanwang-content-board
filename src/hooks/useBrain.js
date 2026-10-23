import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const BRAIN_KEY = ["brain"];

export function useBrainFiles() {
  return useQuery({
    queryKey: BRAIN_KEY,
    queryFn: async () => {
      const page = await base44.entities.BrainFile.list({ sort: "-created_date", limit: 500 });
      return page.items;
    },
  });
}

export function useUploadBrainFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ section, file }) => {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });

      const record = await base44.entities.BrainFile.create({
        section,
        file_name: file.name,
        file_uri,
        file_type: file.type,
        file_size: file.size,
        status: "learning",
      });

      base44.functions
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
      await base44.entities.BrainFile.update(id, { status: "learning", error: "" });
      queryClient.invalidateQueries({ queryKey: BRAIN_KEY });

      base44.functions
        .invoke("learnBrainFile", { file_id: id })
        .catch(() => {})
        .finally(() => queryClient.invalidateQueries({ queryKey: BRAIN_KEY }));
    },
  });
}

export function useDeleteBrainFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => base44.entities.BrainFile.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BRAIN_KEY }),
  });
}