import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Anime } from "@/services/animeApi";

interface AnimeDialogProps {
  anime: Anime | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AnimeDialog = ({ anime, isOpen, onClose }: AnimeDialogProps) => {
  if (!anime) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{anime.title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <img
            src={anime.images.jpg.large_image_url}
            alt={anime.title}
            className="w-full rounded-lg"
          />
          <div>
            <p className="text-sm text-gray-400 mb-4">{anime.synopsis}</p>
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((genre) => (
                <span
                  key={genre.name}
                  className="px-2 py-1 bg-primary/20 text-primary rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};