import { Anime } from "@/services/animeApi";
import { Card } from "@/components/ui/card";

interface AnimeCardProps {
  anime: Anime;
  onClick: (anime: Anime) => void;
}

export const AnimeCard = ({ anime, onClick }: AnimeCardProps) => {
  return (
    <Card 
      className="anime-card cursor-pointer"
      onClick={() => onClick(anime)}
    >
      <img
        src={anime.images.jpg.large_image_url}
        alt={anime.title}
        className="transition-transform duration-300"
      />
      <div className="anime-card-overlay">
        <h3 className="text-lg font-bold text-white line-clamp-1">{anime.title}</h3>
        <p className="text-sm text-gray-300 mt-1">Score: {anime.score}</p>
      </div>
    </Card>
  );
};