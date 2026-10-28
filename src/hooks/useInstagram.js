import { useMutation } from "@tanstack/react-query";

export function useSyncInstagram() {
  return useMutation({
    mutationFn: async () => {
      throw new Error("Connect this channel in the next step");
    },
  });
}