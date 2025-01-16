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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{anime.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {anime.image_url && (
            <img
              src={anime.image_url}
              alt={anime.title}
              className="w-full rounded-lg"
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
            <p className="text-sm text-muted-foreground">{anime.synopsis}</p>
          )}
          {anime.score && (
            <p className="text-sm">
              <strong>Score:</strong> {anime.score}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}