import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash/debounce";
import { AnimeCard } from "@/components/AnimeCard";
import { AnimeDialog } from "@/components/AnimeDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

type Anime = Tables<"anime">;

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const { toast } = useToast();

  const { data: animes, isLoading, error } = useQuery({
    queryKey: ["animes", debouncedQuery],
    queryFn: async () => {
      try {
        let query = supabase
          .from("anime")
          .select("*");

        if (debouncedQuery) {
          query = query.ilike("title", `%${debouncedQuery}%`);
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          console.error("Supabase error:", supabaseError);
          throw supabaseError;
        }

        if (!data) {
          return [];
        }

        console.log("Fetched anime:", data); // Debug log
        return data as Anime[];
      } catch (error: any) {
        console.error("Error fetching anime:", error);
        toast({
          title: "Error",
          description: "Failed to fetch anime. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  // Debounce the search input
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedQuery(value);
    }, 500),
    []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetSearch(value);
  };

  if (error) {
    console.error("Query error:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-primary">Anime Explorer</h1>
      
      <div className="max-w-xl mx-auto mb-8">
        <Input
          type="search"
          placeholder="Search anime..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          An error occurred while fetching the anime list. Please try again.
        </div>
      ) : !animes?.length ? (
        <div className="text-center text-gray-500">
          No anime found. Try a different search term.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {animes.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              onClick={setSelectedAnime}
            />
          ))}
        </div>
      )}

      <AnimeDialog
        anime={selectedAnime}
        isOpen={!!selectedAnime}
        onClose={() => setSelectedAnime(null)}
      />
    </div>
  );
};

export default Index;