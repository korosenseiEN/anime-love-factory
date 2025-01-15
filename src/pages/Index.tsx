import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Anime, fetchTopAnime, searchAnime } from "@/services/animeApi";
import { AnimeCard } from "@/components/AnimeCard";
import { AnimeDialog } from "@/components/AnimeDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);

  const { data: animes, isLoading } = useQuery({
    queryKey: ["animes", searchQuery],
    queryFn: () => (searchQuery ? searchAnime(searchQuery) : fetchTopAnime()),
    staleTime: 5 * 60 * 1000,
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