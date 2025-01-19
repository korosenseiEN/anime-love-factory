import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { AnimeFormHeader } from "./AnimeFormHeader";
import { AnimeSelector } from "./AnimeSelector";
import { AnimeEditForm } from "./AnimeEditForm";
import { CreateAnimeForm } from "./CreateAnimeForm";
import { supabase } from "@/integrations/supabase/client";

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
  const [isSaving, setIsSaving] = useState(false);

  const selectedAnime = animes.find((a) => a.id.toString() === selectedAnimeId);

  useEffect(() => {
    const channel = supabase
      .channel('anime_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'anime' },
        (payload) => {
          console.log('Change received!', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdate = async (updates: Partial<Anime>) => {
    if (!selectedAnime) return;
    setIsSaving(true);
    try {
      await onUpdate(selectedAnime.id, updates);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (!selectedAnime) return;
    setIsSaving(true);
    try {
      await onVideoUpload(selectedAnime.id, file);
    } finally {
      setIsSaving(false);
    }
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
            isSaving={isSaving}
          />
        ) : null}
      </div>
    </Card>
  );
};