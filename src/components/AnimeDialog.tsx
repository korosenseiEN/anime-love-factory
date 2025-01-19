import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Heart, HeartOff } from "lucide-react";
import { useState, useEffect } from "react";

type Anime = Tables<"anime">;

interface AnimeDialogProps {
  anime: Anime | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AnimeDialog({ anime, isOpen, onClose }: AnimeDialogProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkIfFavorited();
  }, [anime]);

  const checkIfFavorited = async () => {
    if (!anime) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: favorite } = await supabase
      .from("favorites")
      .select()
      .eq("user_id", session.user.id)
      .eq("anime_id", anime.id)
      .maybeSingle();

    setIsFavorited(!!favorite);
  };

  const handleFavoriteToggle = async () => {
    if (!anime?.id) {
      toast({
        title: "Error",
        description: "Invalid anime data",
        variant: "destructive",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please login to manage favorites",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      // First, ensure the anime exists in our database
      const { data: existingAnime } = await supabase
        .from("anime")
        .select()
        .eq("id", anime.id)
        .maybeSingle();

      if (!existingAnime) {
        // Insert the anime if it doesn't exist
        const { error: insertError } = await supabase
          .from("anime")
          .insert({
            id: anime.id,
            mal_id: anime.mal_id,
            title: anime.title,
            synopsis: anime.synopsis,
            score: anime.score,
            image_url: anime.image_url,
            video_url: anime.video_url
          });

        if (insertError) throw insertError;
      }

      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", session.user.id)
          .eq("anime_id", anime.id);

        if (error) throw error;

        setIsFavorited(false);
        toast({
          title: "Success",
          description: "Removed from favorites",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("favorites")
          .insert({
            anime_id: anime.id,
            user_id: session.user.id
          });

        if (error) throw error;

        setIsFavorited(true);
        toast({
          title: "Success",
          description: "Added to favorites",
        });
      }
    } catch (error: any) {
      console.error("Favorite toggle error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!anime) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">{anime.title}</DialogTitle>
          <DialogDescription>
            View details and manage favorites for this anime
          </DialogDescription>
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
            <Button 
              onClick={handleFavoriteToggle} 
              className="w-full flex items-center justify-center gap-2"
              variant={isFavorited ? "destructive" : "default"}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : isFavorited ? (
                <>
                  <HeartOff className="w-5 h-5" />
                  Remove from Favorites
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  Add to Favorites
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}