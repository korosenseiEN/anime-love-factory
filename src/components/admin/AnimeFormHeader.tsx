import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
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
            }
          }
        } catch (error) {
          console.error("Error processing anime:", error);
        }
      }

      toast({
        title: "Success",
        description: "Anime data has been fetched and saved",
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