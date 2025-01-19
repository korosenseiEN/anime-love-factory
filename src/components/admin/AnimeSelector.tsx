import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAnimeList } from "@/hooks/useAnimeList";

interface AnimeSelectorProps {
  selectedAnimeId: string;
  onAnimeSelect: (id: string) => void;
}

export const AnimeSelector = ({ selectedAnimeId, onAnimeSelect }: AnimeSelectorProps) => {
  const { data: animes, isLoading } = useAnimeList();

  if (isLoading) {
    return <div>Loading animes...</div>;
  }

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
          <ScrollArea className="h-[200px]">
            {animes?.map((anime) => (
              <SelectItem key={anime.id} value={anime.id.toString()}>
                {anime.title}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
};