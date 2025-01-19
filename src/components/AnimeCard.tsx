import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

type Anime = Tables<"anime">;

interface AnimeCardProps {
  anime: Anime;
  onClick: (anime: Anime) => void;
}

export function AnimeCard({ anime, onClick }: AnimeCardProps) {
  return (
    <Card 
      className="anime-card cursor-pointer relative group"
      onClick={() => onClick(anime)}
    >
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={anime.image_url || "/placeholder.svg"}
            alt={anime.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
            loading="lazy"
          />
          <div className="anime-card-overlay absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-2">
              {anime.title}
            </h3>
            {anime.score && (
              <p className="text-base text-white mb-2">
                Score: {anime.score}
              </p>
            )}
            <p className="text-sm text-white/90">
              {anime.synopsis}
            </p>
          </div>
          {anime.video_url && (
            <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs">
              Has Video
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}