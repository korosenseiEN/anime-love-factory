const BASE_URL = 'https://api.jikan.moe/v4';

export interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  synopsis: string;
  score: number;
  genres: Array<{ name: string }>;
}

export const fetchTopAnime = async (): Promise<Anime[]> => {
  const response = await fetch(`${BASE_URL}/top/anime?limit=12`);
  const data = await response.json();
  return data.data;
};

export const searchAnime = async (query: string): Promise<Anime[]> => {
  const response = await fetch(`${BASE_URL}/anime?q=${query}&limit=12`);
  const data = await response.json();
  return data.data;
};