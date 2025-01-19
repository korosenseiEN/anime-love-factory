import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";

type Anime = Tables<"anime">;

interface AnimeEditFormProps {
  anime: Anime;
  onUpdate: (updates: Partial<Anime>) => Promise<void>;
  onVideoUpload: (file: File) => Promise<void>;
}

export const AnimeEditForm = ({ anime, onUpdate, onVideoUpload }: AnimeEditFormProps) => {
  const [formData, setFormData] = useState<Partial<Anime>>({
    title: anime.title,
    synopsis: anime.synopsis || "",
    score: anime.score || null,
    image_url: anime.image_url || "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(anime.image_url);

  const handleChange = (field: keyof Anime, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImagePreview = (url: string) => {
    setImagePreview(url);
    handleChange("image_url", url);
  };

  const handleSave = async () => {
    await onUpdate(formData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Label htmlFor={`title-${anime.id}`}>Title</Label>
          <Input
            id={`title-${anime.id}`}
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>
        {imagePreview && (
          <img
            src={imagePreview}
            alt={anime.title}
            className="w-24 h-24 object-cover rounded-lg"
          />
        )}
      </div>

      <div>
        <Label htmlFor={`synopsis-${anime.id}`}>Synopsis</Label>
        <Textarea
          id={`synopsis-${anime.id}`}
          value={formData.synopsis || ""}
          className="min-h-[100px]"
          onChange={(e) => handleChange("synopsis", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`score-${anime.id}`}>Score</Label>
          <Input
            id={`score-${anime.id}`}
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={formData.score || ""}
            onChange={(e) => handleChange("score", parseFloat(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor={`image-${anime.id}`}>Image URL</Label>
          <div className="flex space-x-2">
            <Input
              id={`image-${anime.id}`}
              value={formData.image_url || ""}
              onChange={(e) => handleChange("image_url", e.target.value)}
            />
            <Button 
              variant="outline" 
              onClick={() => handleImagePreview(formData.image_url || "")}
            >
              Preview
            </Button>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor={`video-${anime.id}`}>Video Upload</Label>
        <Input
          id={`video-${anime.id}`}
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onVideoUpload(file);
            }
          }}
        />
        {anime.video_url && (
          <div className="mt-4">
            <video
              src={anime.video_url}
              controls
              className="w-full max-w-md rounded-lg"
            />
          </div>
        )}
      </div>

      <Button onClick={handleSave} className="w-full">
        Save Changes
      </Button>
    </div>
  );
};