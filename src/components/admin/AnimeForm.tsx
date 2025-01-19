import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { AnimeFormHeader } from "./AnimeFormHeader";
import { AnimeSelector } from "./AnimeSelector";
import { AnimeEditForm } from "./AnimeEditForm";
import { CreateAnimeForm } from "./CreateAnimeForm";

type Anime = Tables<"anime">;

interface AnimeFormProps {
  animes: Anime[];
  onUpdate: (id: number, updates: Partial<Anime>) => Promise<void>;
  onVideoUpload: (id: number, file: File) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onCreate: (anime: Partial<Anime>) => Promise<void>;
}

export const AnimeForm = ({ 
  animes, 
  onUpdate, 
  onVideoUpload, 
  onDelete, 
  onCreate 
}: AnimeFormProps) => {
  const [selectedAnimeId, setSelectedAnimeId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const selectedAnime = animes.find((a) => a.id.toString() === selectedAnimeId);

  const handleUpdate = async (updates: Partial<Anime>) => {
    if (!selectedAnime) return;
    await onUpdate(selectedAnime.id, updates);
  };

  const handleVideoUpload = async (file: File) => {
    if (!selectedAnime) return;
    await onVideoUpload(selectedAnime.id, file);
  };

  const handleDelete = async () => {
    if (!selectedAnime) return;
    await onDelete(selectedAnime.id);
    setSelectedAnimeId("");
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <AnimeFormHeader
          isCreating={isCreating}
          selectedAnime={selectedAnime}
          onCreateToggle={() => setIsCreating(!isCreating)}
          onDelete={handleDelete}
        />

        {!isCreating && (
          <AnimeSelector
            animes={animes}
            selectedAnimeId={selectedAnimeId}
            onAnimeSelect={setSelectedAnimeId}
          />
        )}

        {isCreating ? (
          <CreateAnimeForm
            onCreate={async (anime) => {
              await onCreate(anime);
              setIsCreating(false);
            }}
          />
        ) : selectedAnime ? (
          <AnimeEditForm
            anime={selectedAnime}
            onUpdate={handleUpdate}
            onVideoUpload={handleVideoUpload}
          />
        ) : null}
      </div>
    </Card>
  );
};