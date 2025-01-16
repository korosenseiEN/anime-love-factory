import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tables } from "@/integrations/supabase/types";

type Anime = Tables<"anime">;

interface AnimeFormProps {
  anime: Anime;
  onUpdate: (id: number, updates: Partial<Anime>) => Promise<void>;
  onVideoUpload: (id: number, file: File) => Promise<void>;
}

export const AnimeForm = ({ anime, onUpdate, onVideoUpload }: AnimeFormProps) => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border">
      <div className="grid gap-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input
            defaultValue={anime.title}
            onBlur={(e) => onUpdate(anime.id, { title: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Synopsis</label>
          <Textarea
            defaultValue={anime.synopsis || ""}
            onBlur={(e) => onUpdate(anime.id, { synopsis: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Score</label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="10"
            defaultValue={anime.score || ""}
            onBlur={(e) =>
              onUpdate(anime.id, { score: parseFloat(e.target.value) })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Image URL</label>
          <Input
            defaultValue={anime.image_url || ""}
            onBlur={(e) => onUpdate(anime.id, { image_url: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Video Upload</label>
          <Input
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
            <div className="mt-2">
              <video
                src={anime.video_url}
                controls
                className="w-full max-w-md"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};