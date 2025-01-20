import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${anime.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('anime-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('anime-images')
        .getPublicUrl(filePath);

      onChange("image_url", data.publicUrl);
      onPreview(data.publicUrl);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

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

      <div>
        <Label htmlFor={`image-upload-${anime.id}`}>Upload Image</Label>
        <Input
          id={`image-upload-${anime.id}`}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        {isUploading && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </div>
        )}
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