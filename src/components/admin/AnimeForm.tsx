import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Anime = Tables<"anime">;

interface AnimeFormProps {
  anime: Anime;
  onUpdate: (id: number, updates: Partial<Anime>) => Promise<void>;
  onVideoUpload: (id: number, file: File) => Promise<void>;
}

export const AnimeForm = ({ anime, onUpdate, onVideoUpload }: AnimeFormProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (field: keyof Anime, value: any) => {
    setIsUpdating(true);
    await onUpdate(anime.id, { [field]: value });
    setIsUpdating(false);
  };

  return (
    <Card className="p-6">
      <div className="grid gap-6">
        <div className="flex items-center space-x-4">
          {anime.image_url && (
            <img
              src={anime.image_url}
              alt={anime.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <div className="space-y-2">
              <Label htmlFor={`title-${anime.id}`}>Title</Label>
              <Input
                id={`title-${anime.id}`}
                defaultValue={anime.title}
                className="text-lg font-medium"
                onBlur={(e) => handleUpdate("title", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`synopsis-${anime.id}`}>Synopsis</Label>
          <Textarea
            id={`synopsis-${anime.id}`}
            defaultValue={anime.synopsis || ""}
            className="min-h-[100px]"
            onBlur={(e) => handleUpdate("synopsis", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`score-${anime.id}`}>Score</Label>
            <Input
              id={`score-${anime.id}`}
              type="number"
              step="0.1"
              min="0"
              max="10"
              defaultValue={anime.score || ""}
              onBlur={(e) =>
                handleUpdate("score", parseFloat(e.target.value))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`image-${anime.id}`}>Image URL</Label>
            <Input
              id={`image-${anime.id}`}
              defaultValue={anime.image_url || ""}
              onBlur={(e) => handleUpdate("image_url", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`video-${anime.id}`}>Video Upload</Label>
          <Input
            id={`video-${anime.id}`}
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onVideoUpload(anime.id, file);
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

        {isUpdating && (
          <div className="text-sm text-muted-foreground">
            Updating...
          </div>
        )}
      </div>
    </Card>
  );
};