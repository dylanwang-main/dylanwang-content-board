import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useSocialAccounts() {
  return useQuery({
    queryKey: ["social-accounts"],
    queryFn: async () => {
      const page = await base44.entities.SocialAccount.list({
        sort: "-updated_date",
        limit: 10,
      });
      return page.items;
    },
  });
}