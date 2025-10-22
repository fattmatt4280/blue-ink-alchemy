import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HealingHistoryEntry {
  id: string;
  photo_url: string;
  photo_urls?: string[];
  healing_stage: string;
  progress_score: number;
  recommendations: string[];
  analysis_result: any;
  created_at: string;
  tattoo_title?: string;
}

export const useHealingHistory = (userId?: string) => {
  return useQuery({
    queryKey: ["healing-history", userId],
    queryFn: async () => {
      let query = supabase
        .from("healing_progress")
        .select("*")
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as HealingHistoryEntry[];
    },
    enabled: true,
  });
};
