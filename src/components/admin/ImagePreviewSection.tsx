import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";

type Anime = Tables<"anime">;

interface ImagePreviewSectionProps {
  anime: Anime;
  imagePreview: string | null;
  onChange: (field: keyof Anime, value: any) => void;
  onPreview: (url: string) => void;
}

export const ImagePreviewSection = ({ 
  anime, 
  imagePreview, 
  onChange, 
  onPreview 
}: ImagePreviewSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`image-${anime.id}`}>Image URL</Label>
        <div className="flex space-x-2">
          <Input
            id={`image-${anime.id}`}
            value={anime.image_url || ""}
            onChange={(e) => onChange("image_url", e.target.value)}
          />
          <Button 
            variant="outline" 
            onClick={() => onPreview(anime.image_url || "")}
          >
            Preview
          </Button>
        </div>
      </div>
      {imagePreview && (
        <img
          src={imagePreview}
          alt={anime.title}
          className="w-24 h-24 object-cover rounded-lg"
        />
      )}
    </div>
  );
};