import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AnimeCard } from "@/components/AnimeCard";
import { AnimeDialog } from "@/components/AnimeDialog";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Anime = Tables<"anime">;

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Anime[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          navigate("/login");
          return;
        }

        if (!session) {
          navigate("/login");
          return;
        }

        await fetchFavorites();
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetch();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/login");
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchFavorites();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // First, get the user's favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from("favorites")
        .select("anime_id")
        .not("anime_id", "is", null);

      if (favoritesError) {
        console.error("Error fetching favorites:", favoritesError);
        throw favoritesError;
      }

      if (!favoritesData || favoritesData.length === 0) {
        setFavorites([]);
        return;
      }

      const animeIds = favoritesData
        .map((f) => f.anime_id)
        .filter((id): id is number => id !== null);

      if (animeIds.length === 0) {
        setFavorites([]);
        return;
      }

      // Then fetch the corresponding anime details
      const { data: animesData, error: animesError } = await supabase
        .from("anime")
        .select("*")
        .in("id", animeIds);

      if (animesError) {
        console.error("Error fetching anime details:", animesError);
        throw animesError;
      }

      setFavorites(animesData || []);
    } catch (error: any) {
      console.error("Failed to fetch favorites:", error);
      toast({
        title: "Error",
        description: "Failed to fetch favorites. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-primary">Loading your favorites...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-primary">
        My Favorites
      </h1>
      {favorites.length === 0 ? (
        <div className="text-center text-gray-500">
          You haven't added any favorites yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              onClick={setSelectedAnime}
            />
          ))}
        </div>
      )}
      <AnimeDialog
        anime={selectedAnime}
        isOpen={!!selectedAnime}
        onClose={() => setSelectedAnime(null)}
      />
    </div>
  );
};

export default FavoritesPage;