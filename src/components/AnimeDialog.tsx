import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";

type Anime = Tables<"anime">;

interface AnimeDialogProps {
  anime: Anime | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AnimeDialog({ anime, isOpen, onClose }: AnimeDialogProps) {
  if (!anime) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{anime.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          {anime.image_url && (
            <img
              src={anime.image_url}
              alt={anime.title}
              className="w-full rounded-lg object-cover max-h-[400px]"
            />
          )}
          {anime.video_url && (
            <video
              src={anime.video_url}
              controls
              className="w-full rounded-lg"
            />
          )}
          {anime.synopsis && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Synopsis</h3>
              <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {anime.synopsis}
              </p>
            </div>
          )}
          {anime.score && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Score:</span>
              <span className="text-lg">{anime.score}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}