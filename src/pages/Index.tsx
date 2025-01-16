import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTopAnime, searchAnime, type APIAnime } from "@/services/animeApi";
import { AnimeCard } from "@/components/AnimeCard";
import { AnimeDialog } from "@/components/AnimeDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Anime = Tables<"anime">;

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const { toast } = useToast();

  const { data: animes, isLoading, error } = useQuery({
    queryKey: ["animes", searchQuery],
    queryFn: async () => {
      const apiAnimes = await (searchQuery ? searchAnime(searchQuery) : fetchTopAnime());
      // Transform API response to match our database schema
      return apiAnimes.map((apiAnime: APIAnime): Anime => ({
        id: apiAnime.mal_id, // Using mal_id as our id
        mal_id: apiAnime.mal_id,
        title: apiAnime.title,
        synopsis: apiAnime.synopsis,
        score: apiAnime.score,
        image_url: apiAnime.images.jpg.image_url,
        video_url: null, // API doesn't provide videos
        updated_at: new Date().toISOString()
      }));
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to fetch anime data. Please try again later.",
          variant: "destructive",
        });
      }
    }
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Anime Explorer</h1>
      
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          Failed to load anime data. Please try again later.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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