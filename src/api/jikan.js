const BASE = 'https://api.jikan.moe/v4';

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json;
}

export async function searchAnime(query, page = 1) {
  const url = `${BASE}/anime?q=${encodeURIComponent(query)}&sfw=true&order_by=score&sort=desc&limit=24&page=${page}`;
  return getJSON(url);
}

export async function getAnimeDetails(id) {
  const url = `${BASE}/anime/${id}/full`;
  return getJSON(url);
}

export async function getAnimeRecommendations(id) {
  const url = `${BASE}/anime/${id}/recommendations`;
  return getJSON(url);
}

export async function getAnimeByGenres(genreIdsCsv, page = 1) {
  // Example genres: '1,4' (Action, Comedy). We also filter to SFW and minimum score to improve quality.
  const url = `${BASE}/anime?genres=${genreIdsCsv}&sfw=true&min_score=7&order_by=score&sort=desc&limit=24&page=${page}`;
  return getJSON(url);
}
