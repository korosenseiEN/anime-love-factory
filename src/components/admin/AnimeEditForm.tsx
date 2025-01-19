import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { FormFields } from "./FormFields";
import { VideoUploadSection } from "./VideoUploadSection";
import { Loader2 } from "lucide-react";

type Anime = Tables<"anime">;

interface AnimeEditFormProps {
  anime: Anime;
  onUpdate: (updates: Partial<Anime>) => Promise<void>;
  onVideoUpload: (file: File) => Promise<void>;
  isSaving: boolean;
}

export const AnimeEditForm = ({ 
  anime, 
  onUpdate, 
  onVideoUpload,
  isSaving
}: AnimeEditFormProps) => {
  const [formData, setFormData] = useState<Partial<Anime>>({
    title: anime.title,
    synopsis: anime.synopsis || "",
    score: anime.score || null,
    image_url: anime.image_url || "",
  });

  const handleChange = (field: keyof Anime, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await onUpdate(formData);
  };

  return (
    <div className="space-y-6">
      <FormFields 
        formData={formData}
        onChange={handleChange}
      />
      
      <VideoUploadSection
        anime={anime}
        onVideoUpload={onVideoUpload}
      />

      <Button 
        onClick={handleSave} 
        className="w-full" 
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  );
};