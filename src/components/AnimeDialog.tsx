import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type Anime = Tables<"anime">;

interface AnimeDialogProps {
  anime: Anime | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AnimeDialog({ anime, isOpen, onClose }: AnimeDialogProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddToFavorites = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please login to add favorites",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!anime) return;

    try {
      // First check if this anime exists in the database
      const { data: existingAnime, error: animeError } = await supabase
        .from("anime")
        .select("id")
        .eq("mal_id", anime.mal_id)
        .maybeSingle();

      if (animeError) {
        console.error("Error checking anime existence:", animeError);
        toast({
          title: "Error",
          description: "Failed to check if anime exists",
          variant: "destructive",
        });
        return;
      }

      let animeId;
      
      if (!existingAnime) {
        // If anime doesn't exist, insert it first
        const { data: newAnime, error: insertError } = await supabase
          .from("anime")
          .insert([{
            mal_id: anime.mal_id,
            title: anime.title,
            synopsis: anime.synopsis,
            score: anime.score,
            image_url: anime.image_url,
            video_url: anime.video_url
          }])
          .select("id")
          .single();

        if (insertError) {
          console.error("Error inserting anime:", insertError);
          toast({
            title: "Error",
            description: "Failed to add anime to database",
            variant: "destructive",
          });
          return;
        }
        
        animeId = newAnime.id;
      } else {
        animeId = existingAnime.id;
      }

      // Check if this anime is already in user's favorites
      const { data: existingFavorite, error: favoriteCheckError } = await supabase
        .from("favorites")
        .select()
        .eq("user_id", session.user.id)
        .eq("anime_id", animeId)
        .maybeSingle();

      if (favoriteCheckError) {
        console.error("Error checking existing favorite:", favoriteCheckError);
        toast({
          title: "Error",
          description: "Failed to check existing favorites",
          variant: "destructive",
        });
        return;
      }

      if (existingFavorite) {
        toast({
          title: "Already in favorites",
          description: "This anime is already in your favorites list",
        });
        return;
      }

      // Add to favorites
      const { error: favoriteError } = await supabase
        .from("favorites")
        .insert([{ 
          anime_id: animeId,
          user_id: session.user.id 
        }]);

      if (favoriteError) {
        // Check if it's a duplicate error
        if (favoriteError.code === "23505") {
          toast({
            title: "Already in favorites",
            description: "This anime is already in your favorites list",
          });
          return;
        }
        
        console.error("Error adding to favorites:", favoriteError);
        toast({
          title: "Error",
          description: "Failed to add to favorites",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Added to favorites",
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (!anime) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">{anime.title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img
              src={anime.image_url || "/placeholder.svg"}
              alt={anime.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Synopsis</h3>
              <p className="text-base leading-relaxed text-foreground/90">{anime.synopsis}</p>
            </div>
            {anime.score && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Score</h3>
                <p className="text-xl font-bold text-primary">{anime.score}</p>
              </div>
            )}
            {anime.video_url && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Video Preview</h3>
                <video
                  src={anime.video_url}
                  controls
                  className="w-full rounded-lg"
                  poster={anime.image_url || undefined}
                />
              </div>
            )}
            <Button onClick={handleAddToFavorites} className="w-full">
              Add to Favorites
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}