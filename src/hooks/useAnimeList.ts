import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Anime = Tables<"anime">;

export function useAnimeList() {
  return useQuery({
    queryKey: ["animes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("anime")
        .select("*")
        .order("title", { ascending: true });

      if (error) throw error;
      return data as Anime[];
    },
  });
}