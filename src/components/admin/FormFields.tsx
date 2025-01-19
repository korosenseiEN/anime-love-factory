import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tables } from "@/integrations/supabase/types";

type Anime = Tables<"anime">;

interface FormFieldsProps {
  formData: Partial<Anime>;
  onChange: (field: keyof Anime, value: any) => void;
}

export function FormFields({ formData, onChange }: FormFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="synopsis">Synopsis</Label>
        <Textarea
          id="synopsis"
          value={formData.synopsis || ""}
          onChange={(e) => onChange("synopsis", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="score">Score</Label>
        <Input
          id="score"
          type="number"
          step="0.1"
          min="0"
          max="10"
          value={formData.score || ""}
          onChange={(e) => onChange("score", parseFloat(e.target.value))}
        />
      </div>

      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          value={formData.image_url || ""}
          onChange={(e) => onChange("image_url", e.target.value)}
        />
      </div>
    </div>
  );
}