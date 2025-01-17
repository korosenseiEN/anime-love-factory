import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash/debounce";
import { fetchTopAnime, searchAnime, type APIAnime } from "@/services/animeApi";
import { AnimeCard } from "@/components/AnimeCard";
import { AnimeDialog } from "@/components/AnimeDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

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
        const apiAnimes = await (debouncedQuery ? searchAnime(debouncedQuery) : fetchTopAnime());
        return apiAnimes.map((apiAnime: APIAnime): Anime => ({
          id: apiAnime.mal_id,
          mal_id: apiAnime.mal_id,
          title: apiAnime.title,
          synopsis: apiAnime.synopsis,
          score: apiAnime.score,
          image_url: apiAnime.images.jpg.large_image_url || apiAnime.images.jpg.image_url,
          video_url: null,
          updated_at: new Date().toISOString()
        }));
      } catch (error: any) {
        // Check if it's a rate limit error
        if (error.message?.includes('429')) {
          toast({
            title: "Rate Limit Reached",
            description: "Please wait a moment before searching again.",
            variant: "destructive",
          });
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
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
          Please try again in a moment. The API has a rate limit.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {animes?.map((anime) => (
            <AnimeCard
              key={anime.mal_id}
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