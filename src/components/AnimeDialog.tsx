import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

    if (!anime) return;

    if (isFavorited) {
      // Remove from favorites
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", session.user.id)
        .eq("anime_id", anime.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove from favorites",
          variant: "destructive",
        });
        return;
      }

      setIsFavorited(false);
      toast({
        title: "Success",
        description: "Removed from favorites",
      });
    } else {
      // Add to favorites
      const { error } = await supabase
        .from("favorites")
        .insert([{ 
          anime_id: anime.id,
          user_id: session.user.id 
        }]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add to favorites",
          variant: "destructive",
        });
        return;
      }

      setIsFavorited(true);
      toast({
        title: "Success",
        description: "Added to favorites",
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
            <Button 
              onClick={handleFavoriteToggle} 
              className="w-full flex items-center justify-center gap-2"
              variant={isFavorited ? "destructive" : "default"}
            >
              {isFavorited ? (
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
