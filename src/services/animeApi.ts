const BASE_URL = 'https://api.jikan.moe/v4';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      // If we hit the rate limit, wait longer before retrying
      if (response.status === 429) {
        console.log(`Rate limited, waiting ${(i + 1) * 2}s before retry ${i + 1}/${retries}`);
        await delay(2000 * (i + 1)); // Progressive delay: 2s, 4s, 6s
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Add a small delay between successful requests to avoid rate limits
      await delay(1000);
      return response;
    } catch (error) {
      console.error(`Attempt ${i + 1}/${retries} failed:`, error);
      if (i === retries - 1) throw error;
      await delay(2000 * (i + 1));
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
    console.log('Fetching top anime...');
    const response = await fetchWithRetry(`${BASE_URL}/top/anime?limit=12`);
    const data = await response.json();
    console.log('Successfully fetched top anime');
    return data.data;
  } catch (error) {
    console.error('Error fetching top anime:', error);
    throw error;
  }
};

export const searchAnime = async (query: string): Promise<APIAnime[]> => {
  try {
    console.log(`Searching anime with query: ${query}`);
    const response = await fetchWithRetry(`${BASE_URL}/anime?q=${query}&limit=12`);
    const data = await response.json();
    console.log('Successfully fetched search results');
    return data.data;
  } catch (error) {
    console.error('Error searching anime:', error);
    throw error;
  }
};