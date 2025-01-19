import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";
import { Video } from "lucide-react";

type Anime = Tables<"anime">;

interface AnimeCardProps {
  anime: Anime;
  onClick: (anime: Anime) => void;
}

export function AnimeCard({ anime, onClick }: AnimeCardProps) {
  return (
    <Card 
      className="anime-card cursor-pointer relative group h-[400px] flex flex-col"
      onClick={() => onClick(anime)}
    >
      <CardContent className="p-0 flex flex-col h-full">
        <div className="relative flex-shrink-0">
          <img
            src={anime.image_url || "/placeholder.svg"}
            alt={anime.title}
            className="w-full h-[200px] object-cover rounded-t-lg"
            loading="lazy"
          />
          <div className="anime-card-overlay absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="p-4">
              <h3 className="text-xl font-bold text-white mb-2">
                {anime.title}
              </h3>
              {anime.score && (
                <p className="text-base text-white mb-2">
                  Score: {anime.score}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 p-4">
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            <p className="text-sm text-foreground/90">
              {anime.synopsis}
            </p>
          </div>
          {anime.video_url && (
            <Link
              to={`/video/${anime.id}`}
              className="mt-4 bg-primary/90 text-primary-foreground p-2 rounded-md flex items-center justify-center gap-2 hover:bg-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <Video size={16} />
              Watch Video
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}