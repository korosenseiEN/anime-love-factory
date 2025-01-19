import { Dialog, DialogContent as UIDialogContent } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DialogHeader } from "./dialog/DialogHeader";
import { DialogContent } from "./dialog/DialogContent";
import { DialogActions } from "./dialog/DialogActions";

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
      if (isFavorited) {
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
      <UIDialogContent className="max-w-3xl">
        <DialogHeader anime={anime} />
        <DialogContent anime={anime} />
        <DialogActions 
          anime={anime}
          isFavorited={isFavorited}
          isLoading={isLoading}
          onFavoriteToggle={handleFavoriteToggle}
        />
      </UIDialogContent>
    </Dialog>
  );
}