import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchTopAnime } from "@/services/animeApi";

interface AnimeFormHeaderProps {
  isCreating: boolean;
  selectedAnime: any;
  onCreateToggle: () => void;
  onDelete: () => void;
}

export const AnimeFormHeader = ({ 
  isCreating, 
  selectedAnime, 
  onCreateToggle, 
  onDelete 
}: AnimeFormHeaderProps) => {
  const [isFetching, setIsFetching] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const handleFetchAnime = async () => {
    setIsFetching(true);
    try {
      // First check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to fetch anime data",
          variant: "destructive",
        });
        return;
      }

      const animeList = await fetchTopAnime();
      let addedCount = 0;
      
      for (const anime of animeList) {
        try {
          // Check if anime already exists
          const { data: existingAnime, error: selectError } = await supabase
            .from("anime")
            .select("id")
            .eq("mal_id", anime.mal_id)
            .maybeSingle();

          if (selectError) {
            console.error("Error checking existing anime:", selectError);
            continue;
          }

          if (!existingAnime) {
            // Insert new anime
            const { error: insertError } = await supabase
              .from("anime")
              .insert({
                mal_id: anime.mal_id,
                title: anime.title,
                synopsis: anime.synopsis,
                score: anime.score,
                image_url: anime.images.jpg.large_image_url,
              });

            if (insertError) {
              console.error("Error inserting anime:", insertError);
              toast({
                title: "Error",
                description: `Failed to save ${anime.title}: ${insertError.message}`,
                variant: "destructive",
              });
            } else {
              addedCount++;
            }
          }
        } catch (error) {
          console.error("Error processing anime:", error);
        }
      }

      toast({
        title: "Success",
        description: `Added ${addedCount} new anime to the database`,
      });
    } catch (error) {
      console.error("Error fetching anime:", error);
      toast({
        title: "Error",
        description: "Failed to fetch anime data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleCheckNewAnime = async () => {
    setIsChecking(true);
    try {
      // First check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to check for new anime",
          variant: "destructive",
        });
        return;
      }

      // Get all existing mal_ids from the database
      const { data: existingAnime, error: fetchError } = await supabase
        .from("anime")
        .select("mal_id");

      if (fetchError) {
        throw fetchError;
      }

      const existingMalIds = new Set(existingAnime?.map(a => a.mal_id));
      const animeList = await fetchTopAnime();
      let newAnimeCount = 0;

      for (const anime of animeList) {
        if (!existingMalIds.has(anime.mal_id)) {
          const { error: insertError } = await supabase
            .from("anime")
            .insert({
              mal_id: anime.mal_id,
              title: anime.title,
              synopsis: anime.synopsis,
              score: anime.score,
              image_url: anime.images.jpg.large_image_url,
            });

          if (insertError) {
            console.error("Error inserting new anime:", insertError);
          } else {
            newAnimeCount++;
          }
        }
      }

      toast({
        title: "Check Complete",
        description: newAnimeCount > 0 
          ? `Found and added ${newAnimeCount} new anime!` 
          : "No new anime found.",
      });

    } catch (error) {
      console.error("Error checking for new anime:", error);
      toast({
        title: "Error",
        description: "Failed to check for new anime. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <Button
          onClick={onCreateToggle}
          className="mb-4"
        >
          {isCreating ? "Cancel" : "Add New Anime"}
        </Button>
        <Button
          onClick={handleFetchAnime}
          disabled={isFetching}
          className="mb-4"
        >
          <Download className="mr-2" />
          {isFetching ? "Fetching..." : "Fetch Anime"}
        </Button>
        <Button
          onClick={handleCheckNewAnime}
          disabled={isChecking}
          className="mb-4"
        >
          <RefreshCw className={`mr-2 ${isChecking ? "animate-spin" : ""}`} />
          {isChecking ? "Checking..." : "Check for New Anime"}
        </Button>
      </div>
      {selectedAnime && (
        <Button
          variant="destructive"
          onClick={onDelete}
          className="mb-4"
        >
          <Trash2 className="mr-2" />
          Delete Anime
        </Button>
      )}
    </div>
  );
};