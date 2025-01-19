import { Tables } from "@/integrations/supabase/types";

type Anime = Tables<"anime">;

interface DialogContentProps {
  anime: Anime;
}

export function DialogContent({ anime }: DialogContentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[60vh]">
      <div>
        <img
          src={anime.image_url || "/placeholder.svg"}
          alt={anime.title}
          className="w-full rounded-lg shadow-lg"
        />
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Synopsis</h3>
          <p className="text-base leading-relaxed text-foreground/90">{anime.synopsis}</p>
        </div>
        {anime.score && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Score</h3>
            <p className="text-xl font-bold text-primary">{anime.score}</p>
          </div>
        )}
        {anime.video_url && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Video Preview</h3>
            <video
              src={anime.video_url}
              controls
              className="w-full rounded-lg"
              poster={anime.image_url || undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}