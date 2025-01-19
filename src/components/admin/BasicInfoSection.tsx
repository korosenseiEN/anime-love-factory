import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tables } from "@/integrations/supabase/types";

type Anime = Tables<"anime">;

interface BasicInfoSectionProps {
  anime: Anime;
  onChange: (field: keyof Anime, value: any) => void;
}

export const BasicInfoSection = ({ anime, onChange }: BasicInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`title-${anime.id}`}>Title</Label>
        <Input
          id={`title-${anime.id}`}
          value={anime.title}
          onChange={(e) => onChange("title", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor={`synopsis-${anime.id}`}>Synopsis</Label>
        <Textarea
          id={`synopsis-${anime.id}`}
          value={anime.synopsis || ""}
          className="min-h-[100px]"
          onChange={(e) => onChange("synopsis", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor={`score-${anime.id}`}>Score</Label>
        <Input
          id={`score-${anime.id}`}
          type="number"
          step="0.1"
          min="0"
          max="10"
          value={anime.score || ""}
          onChange={(e) => onChange("score", parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};