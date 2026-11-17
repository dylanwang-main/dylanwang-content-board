import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/db";

export function useOutliers() {
  return useQuery({
    queryKey: ["outliers"],
    queryFn: async () => {
      const page = await api.entities.Outlier.list({
        sort: "-engagement_score",
        limit: 200,
      });
      return page.items;
    },
    refetchInterval: (query) =>
      (query.state.data || []).some((item) => item.status === "dissecting") ? 5000 : false,
  });
}

export function useDetectOutliers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const response = await api.functions.invoke("detectOutliers", {});
        return response.data;
      } catch (error) {
        throw new Error(
          error?.response?.data?.error ||
            error?.message ||
            "Could not find outliers. Please try again."
        );
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outliers"] }),
  });
}

export function useDissectOutlier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.entities.Outlier.update(id, { status: "dissecting" });
      await queryClient.invalidateQueries({ queryKey: ["outliers"] });

      api.functions
        .invoke("dissectOutlier", { outlier_id: id })
        .catch(() => {})
        .finally(() => queryClient.invalidateQueries({ queryKey: ["outliers"] }));

      return id;
    },
  });
}

export function useGenerateVariations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (outlierId) => {
      try {
        const response = await api.functions.invoke("generateVariations", {
          outlier_id: outlierId,
        });
        return response.data;
      } catch (error) {
        throw new Error(
          error?.response?.data?.error ||
            error?.message ||
            "Could not create variations. Please try again."
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outliers"] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
  });
}

export function useDeleteOutlier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.entities.Outlier.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outliers"] }),
  });
}