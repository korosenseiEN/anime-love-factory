import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tables } from "@/integrations/supabase/types";

type Anime = Tables<"anime">;

interface AnimeSelectorProps {
  animes: Anime[];
  selectedAnimeId: string;
  onAnimeSelect: (id: string) => void;
}

export const AnimeSelector = ({ animes, selectedAnimeId, onAnimeSelect }: AnimeSelectorProps) => {
  return (
    <div className="space-y-4">
      <Label>Select Anime to Edit</Label>
      <Select
        value={selectedAnimeId}
        onValueChange={onAnimeSelect}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select an anime..." />
        </SelectTrigger>
        <SelectContent>
          {animes.map((anime) => (
            <SelectItem key={anime.id} value={anime.id.toString()}>
              {anime.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};