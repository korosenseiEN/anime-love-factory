import { Link } from "react-router-dom";
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
      className="anime-card cursor-pointer"
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
          <div className="anime-card-overlay">
            <h3 className="text-lg font-semibold text-white mb-1 truncate">
              {anime.title}
            </h3>
            {anime.score && (
              <p className="text-sm text-white/80">
                Score: {anime.score}
              </p>
            )}
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