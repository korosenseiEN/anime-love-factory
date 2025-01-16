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
      className="overflow-hidden cursor-pointer transition-transform hover:scale-105"
      onClick={() => onClick(anime)}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[2/3]">
          <img
            src={anime.image_url || "/placeholder.svg"}
            alt={anime.title}
            className="object-cover w-full h-full"
          />
          {anime.video_url && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
              Has Video
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold truncate">{anime.title}</h3>
          {anime.score && (
            <p className="text-sm text-muted-foreground">
              Score: {anime.score}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}