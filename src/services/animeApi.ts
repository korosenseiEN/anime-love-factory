const BASE_URL = 'https://api.jikan.moe/v4';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      
      // If we hit the rate limit, wait longer before retrying
      if (response.status === 429) {
        await delay(1000 * (i + 1)); // Progressive delay: 1s, 2s, 3s
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(1000 * (i + 1));
    }
  }
  throw new Error('Failed to fetch after retries');
}

export interface APIAnime {
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

export const fetchTopAnime = async (): Promise<APIAnime[]> => {
  try {
    const response = await fetchWithRetry(`${BASE_URL}/top/anime?limit=12`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching top anime:', error);
    throw error; // Re-throw to let the query handle the error
  }
};

export const searchAnime = async (query: string): Promise<APIAnime[]> => {
  try {
    const response = await fetchWithRetry(`${BASE_URL}/anime?q=${query}&limit=12`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error searching anime:', error);
    throw error; // Re-throw to let the query handle the error
  }
};