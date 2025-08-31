import { useEffect, useMemo, useState } from 'react';
import SearchBar from './components/SearchBar';
import AnimeCard from './components/AnimeCard';
import AnimeModal from './components/AnimeModal';
import Reviews from './components/Reviews';
import useLocalStorage from './useLocalStorage';
import { searchAnime, getAnimeByGenres } from './api/jikan';

function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-gray-800">
      <div className="header-gradient h-1 w-full"></div>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-xl font-extrabold tracking-tight">🎌 Anime Recommender</div>
        <nav className="flex items-center gap-4 text-sm text-gray-300">
          <a href="#search" className="hover:text-white">Search</a>
          <a href="#watchlist" className="hover:text-white">Watchlist</a>
          <a href="#foryou" className="hover:text-white">For You</a>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const [watchlist, setWatchlist] = useLocalStorage('watchlist', []);

  const watchIds = useMemo(() => new Set(watchlist.map(a => a.mal_id)), [watchlist]);

  function toggleWatchlist(anime) {
    const exists = watchIds.has(anime.mal_id);
    if (exists) {
      setWatchlist(watchlist.filter(a => a.mal_id !== anime.mal_id));
    } else {
      // Keep a minimal snapshot to save space
      const snapshot = {
        mal_id: anime.mal_id,
        title: anime.title || anime.title_english || anime.title_japanese,
        images: anime.images,
        score: anime.score ?? null,
        type: anime.type ?? null,
        episodes: anime.episodes ?? null,
        genres: anime.genres ?? [],
      };
      setWatchlist([snapshot, ...watchlist]);
    }
  }

  async function doSearch(q, nextPage = 1) {
    setQuery(q);
    setPage(nextPage);
    setLoading(true);
    setError(null);
    try {
      const json = await searchAnime(q, nextPage);
      setResults(json.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // "For You" — genre-based recommendations derived from watchlist
  const topGenreIdsCsv = useMemo(() => {
    const counts = new Map();
    for (const a of watchlist) {
      for (const g of (a.genres || [])) {
        counts.set(g.mal_id, (counts.get(g.mal_id) || 0) + 1);
      }
    }
    const sorted = Array.from(counts.entries()).sort((a,b) => b[1]-a[1]).slice(0,3);
    return sorted.map(([id]) => id).join(',');
  }, [watchlist]);

  const [forYou, setForYou] = useState([]);
  const [forYouError, setForYouError] = useState(null);
  const [forYouLoading, setForYouLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!topGenreIdsCsv) { setForYou([]); return; }
      setForYouLoading(true);
      setForYouError(null);
      try {
        const json = await getAnimeByGenres(topGenreIdsCsv, 1);
        if (!active) return;
        setForYou(json.data || []);
      } catch (e) {
        setForYouError(e.message);
      } finally {
        setForYouLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [topGenreIdsCsv]);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero / Search */}
      <section id="search" className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Find your next anime</h1>
          <p className="text-gray-400 mt-1">Search by title, open details, save to watchlist, and get smart recommendations.</p>
        </div>

        <SearchBar onSearch={(q) => doSearch(q)} initial={query} />

        {loading && <div className="mt-4 text-gray-400">Loading…</div>}
        {error && <div className="mt-4 text-red-400">Error: {error}</div>}

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map(anime => (
            <AnimeCard
              key={anime.mal_id}
              anime={anime}
              onOpen={setSelected}
              inWatchlist={watchIds.has(anime.mal_id)}
              onToggleWatchlist={toggleWatchlist}
            />
          ))}
        </div>
      </section>

      {/* Watchlist */}
      <section id="watchlist" className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <h2 className="text-2xl font-bold mb-4">Your Watchlist</h2>
        {watchlist.length === 0 ? (
          <div className="text-gray-400">No items yet. Search above and click <span className="underline">Save</span> to add some.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {watchlist.map(anime => (
              <AnimeCard
                key={anime.mal_id}
                anime={anime}
                onOpen={setSelected}
                inWatchlist={true}
                onToggleWatchlist={toggleWatchlist}
              />
            ))}
          </div>
        )}
      </section>

      {/* For You */}
      <section id="foryou" className="max-w-7xl mx-auto px-4 pt-8 pb-16">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">For You</h2>
          <div className="text-xs text-gray-400">Based on your top genres from watchlist</div>
        </div>
        {!topGenreIdsCsv && (
          <div className="text-gray-400">Add a few shows to your watchlist to unlock personalized picks.</div>
        )}
        {forYouLoading && <div className="text-gray-400">Loading recommendations…</div>}
        {forYouError && <div className="text-red-400">Error: {forYouError}</div>}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {forYou.map(anime => (
            <AnimeCard
              key={anime.mal_id}
              anime={anime}
              onOpen={setSelected}
              inWatchlist={watchIds.has(anime.mal_id)}
              onToggleWatchlist={toggleWatchlist}
            />
          ))}
        </div>
      </section>

      {selected && (
        <AnimeModal
          anime={selected}
          onClose={() => setSelected(null)}
          inWatchlist={watchIds.has(selected.mal_id)}
          onToggleWatchlist={toggleWatchlist}
        />
      )}
    </div>
  )
}
