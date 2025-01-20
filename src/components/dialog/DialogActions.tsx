import { Button } from "@/components/ui/button";
import { Heart, HeartOff } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Anime = Tables<"anime">;

interface DialogActionsProps {
  anime: Anime;
  isFavorited: boolean;
  isLoading: boolean;
  onFavoriteToggle: () => Promise<void>;
}

export function DialogActions({ 
  anime, 
  isFavorited, 
  isLoading, 
  onFavoriteToggle 
}: DialogActionsProps) {
  return (
    <div className="bg-background pt-4 border-t">
      <Button 
        onClick={onFavoriteToggle} 
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
  );
}