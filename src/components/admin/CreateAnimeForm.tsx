import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";

type Anime = Tables<"anime">;

interface CreateAnimeFormProps {
  onCreate: (anime: Partial<Anime>) => Promise<void>;
}

export const CreateAnimeForm = ({ onCreate }: CreateAnimeFormProps) => {
  const [newAnime, setNewAnime] = useState<Partial<Anime>>({
    title: "",
    synopsis: "",
    score: null,
    image_url: "",
    mal_id: 0,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (field: keyof Anime, value: any) => {
    setNewAnime((prev) => ({ ...prev, [field]: value }));
  };

  const handleImagePreview = () => {
    setImagePreview(newAnime.image_url || null);
  };

  const handleCreate = async () => {
    await onCreate(newAnime);
    setNewAnime({
      title: "",
      synopsis: "",
      score: null,
      image_url: "",
      mal_id: 0,
    });
    setImagePreview(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="new-title">Title</Label>
        <Input
          id="new-title"
          value={newAnime.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="new-synopsis">Synopsis</Label>
        <Textarea
          id="new-synopsis"
          value={newAnime.synopsis || ""}
          onChange={(e) => handleChange("synopsis", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="new-score">Score</Label>
          <Input
            id="new-score"
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={newAnime.score || ""}
            onChange={(e) => handleChange("score", parseFloat(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="new-image">Image URL</Label>
          <div className="flex space-x-2">
            <Input
              id="new-image"
              value={newAnime.image_url || ""}
              onChange={(e) => handleChange("image_url", e.target.value)}
            />
            <Button 
              variant="outline" 
              onClick={handleImagePreview}
            >
              Preview
            </Button>
          </div>
        </div>
      </div>

      {imagePreview && (
        <div className="mt-2">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-lg"
          />
        </div>
      )}

      <div>
        <Label htmlFor="new-mal-id">MAL ID</Label>
        <Input
          id="new-mal-id"
          type="number"
          value={newAnime.mal_id || ""}
          onChange={(e) => handleChange("mal_id", parseInt(e.target.value))}
        />
      </div>

      <Button onClick={handleCreate} className="w-full">
        Create Anime
      </Button>
    </div>
  );
};