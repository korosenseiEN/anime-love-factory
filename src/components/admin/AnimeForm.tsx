import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

type Anime = Tables<"anime">;

interface AnimeFormProps {
  animes: Anime[];
  onUpdate: (id: number, updates: Partial<Anime>) => Promise<void>;
  onVideoUpload: (id: number, file: File) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onCreate: (anime: Partial<Anime>) => Promise<void>;
}

export const AnimeForm = ({ animes, onUpdate, onVideoUpload, onDelete, onCreate }: AnimeFormProps) => {
  const [selectedAnimeId, setSelectedAnimeId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newAnime, setNewAnime] = useState<Partial<Anime>>({
    title: "",
    synopsis: "",
    score: null,
    image_url: "",
    mal_id: 0,
  });

  const selectedAnime = animes.find((a) => a.id.toString() === selectedAnimeId);

  const handleUpdate = async (field: keyof Anime, value: any) => {
    if (!selectedAnime) return;
    setIsUpdating(true);
    await onUpdate(selectedAnime.id, { [field]: value });
    setIsUpdating(false);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    await onCreate(newAnime);
    setIsCreating(false);
    setIsCreating(false);
    setNewAnime({
      title: "",
      synopsis: "",
      score: null,
      image_url: "",
      mal_id: 0,
    });
  };

  const handleDelete = async () => {
    if (!selectedAnime) return;
    await onDelete(selectedAnime.id);
    setSelectedAnimeId("");
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="mb-4"
          >
            {isCreating ? "Cancel" : "Add New Anime"}
          </Button>
          {selectedAnime && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="mb-4"
            >
              <Trash2 className="mr-2" />
              Delete Anime
            </Button>
          )}
        </div>

        {!isCreating && (
          <div className="space-y-4">
            <Label>Select Anime to Edit</Label>
            <Select
              value={selectedAnimeId}
              onValueChange={setSelectedAnimeId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an anime..." />
              </SelectTrigger>
              <SelectContent>
                {animes.map((anime) => (
                  <SelectItem key={anime.id} value={anime.id.toString()}>
                    {anime.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isCreating ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-title">Title</Label>
              <Input
                id="new-title"
                value={newAnime.title}
                onChange={(e) => setNewAnime({ ...newAnime, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="new-synopsis">Synopsis</Label>
              <Textarea
                id="new-synopsis"
                value={newAnime.synopsis || ""}
                onChange={(e) => setNewAnime({ ...newAnime, synopsis: e.target.value })}
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
                  onChange={(e) => setNewAnime({ ...newAnime, score: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="new-image">Image URL</Label>
                <Input
                  id="new-image"
                  value={newAnime.image_url || ""}
                  onChange={(e) => setNewAnime({ ...newAnime, image_url: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="new-mal-id">MAL ID</Label>
              <Input
                id="new-mal-id"
                type="number"
                value={newAnime.mal_id || ""}
                onChange={(e) => setNewAnime({ ...newAnime, mal_id: parseInt(e.target.value) })}
              />
            </div>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Anime"}
            </Button>
          </div>
        ) : selectedAnime ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {selectedAnime.image_url && (
                <img
                  src={selectedAnime.image_url}
                  alt={selectedAnime.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <Label htmlFor={`title-${selectedAnime.id}`}>Title</Label>
                <Input
                  id={`title-${selectedAnime.id}`}
                  defaultValue={selectedAnime.title}
                  onBlur={(e) => handleUpdate("title", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`synopsis-${selectedAnime.id}`}>Synopsis</Label>
              <Textarea
                id={`synopsis-${selectedAnime.id}`}
                defaultValue={selectedAnime.synopsis || ""}
                className="min-h-[100px]"
                onBlur={(e) => handleUpdate("synopsis", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`score-${selectedAnime.id}`}>Score</Label>
                <Input
                  id={`score-${selectedAnime.id}`}
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  defaultValue={selectedAnime.score || ""}
                  onBlur={(e) => handleUpdate("score", parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor={`image-${selectedAnime.id}`}>Image URL</Label>
                <Input
                  id={`image-${selectedAnime.id}`}
                  defaultValue={selectedAnime.image_url || ""}
                  onBlur={(e) => handleUpdate("image_url", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`video-${selectedAnime.id}`}>Video Upload</Label>
              <Input
                id={`video-${selectedAnime.id}`}
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onVideoUpload(selectedAnime.id, file);
                  }
                }}
              />
              {selectedAnime.video_url && (
                <div className="mt-4">
                  <video
                    src={selectedAnime.video_url}
                    controls
                    className="w-full max-w-md rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        ) : null}

        {isUpdating && (
          <div className="text-sm text-muted-foreground">
            Updating...
          </div>
        )}
      </div>
    </Card>
  );
};