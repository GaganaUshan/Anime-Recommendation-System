import { useEffect, useState } from 'react';
import { getAnimeDetails, getAnimeRecommendations } from '../api/jikan';
import Reviews from './Reviews';

export default function AnimeModal({ anime, onClose, onToggleWatchlist, inWatchlist }) {
  const [details, setDetails] = useState(null);
  const [recs, setRecs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const d = await getAnimeDetails(anime.mal_id);
        if (!active) return;
        setDetails(d.data);
        const r = await getAnimeRecommendations(anime.mal_id);
        if (!active) return;
        setRecs(r.data?.map(x => x.entry)?.filter(Boolean) ?? []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [anime.mal_id]);

  const img = details?.images?.jpg?.large_image_url || anime?.images?.jpg?.image_url;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-4xl bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex gap-4 p-4">
          <img src={img} alt={details?.title || anime.title} className="w-48 h-64 object-cover rounded-xl border border-gray-800" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-2xl font-bold">{details?.title || anime.title}</h3>
              <button onClick={() => onToggleWatchlist(details || anime)}
                className={`px-3 py-2 rounded-lg ${inWatchlist ? 'bg-teal-700 hover:bg-teal-600' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
                {inWatchlist ? 'Saved' : 'Save'}
              </button>
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {details?.type} • {details?.episodes ?? '?'} eps • ⭐ {details?.score ?? anime?.score ?? 'N/A'}
            </div>
            {loading ? (
              <div className="mt-3 text-gray-400">Loading…</div>
            ) : error ? (
              <div className="mt-3 text-red-400">Error: {error}</div>
            ) : (
              <>
                <p className="mt-3 text-gray-200 line-clamp-[10]">{details?.synopsis}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(details?.genres ?? []).map(g => (
                    <span key={g.mal_id} className="text-xs px-2 py-1 rounded-full bg-gray-800 border border-gray-700">{g.name}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="px-4 pb-4">
          <h4 className="text-lg font-semibold mb-2">Recommendations</h4>
          {recs?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {recs.slice(0, 12).map((r) => (
                <a key={r.mal_id} href={`https://myanimelist.net/anime/${r.mal_id}`} target="_blank" rel="noreferrer"
                  className="block group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <img src={r.images?.jpg?.image_url} alt={r.title} className="aspect-[3/4] w-full object-cover" />
                  <div className="p-2 text-sm line-clamp-2 group-hover:underline">{r.title}</div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">No recommendations found.</div>
          )}

          <Reviews animeId={anime.mal_id} />
        </div>

        <div className="p-3 border-t border-gray-800 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700">Close</button>
        </div>
      </div>
    </div>
  );
}
