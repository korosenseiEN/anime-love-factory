import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tables } from "@/integrations/supabase/types";

type Anime = Tables<"anime">;

interface VideoUploadSectionProps {
  anime: Anime;
  onVideoUpload: (file: File) => Promise<void>;
}

export const VideoUploadSection = ({ anime, onVideoUpload }: VideoUploadSectionProps) => {
  return (
    <div className="space-y-4">
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
      </div>
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
  );
};