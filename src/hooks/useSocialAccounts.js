import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/db";

export function useSocialAccounts() {
  return useQuery({
    queryKey: ["social-accounts"],
    queryFn: async () => {
      const page = await api.entities.SocialAccount.list({
        sort: "-updated_date",
        limit: 10,
      });
      return page.items;
    },
  });
}