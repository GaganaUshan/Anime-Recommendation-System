export default function AnimeCard({ anime, onOpen, inWatchlist, onToggleWatchlist }) {
  const img = anime?.images?.jpg?.image_url || anime?.images?.webp?.image_url;
  const title = anime?.title || anime?.title_english || anime?.title_japanese || 'Untitled';

  return (
    <div className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition">
      <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => onOpen(anime)}>
        {img ? (
          <img src={img} alt={title} className="h-full w-full object-cover group-hover:scale-[1.03] transition" />
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-500">No Image</div>
        )}
        <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/70 text-xs">
          ⭐ {anime?.score ?? 'N/A'}
        </div>
      </div>
      <div className="p-3 flex flex-col gap-2">
        <h3 className="font-semibold line-clamp-2">{title}</h3>
        <div className="text-xs text-gray-400">
          {anime?.type} • {anime?.episodes ?? '?'} eps
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onOpen(anime)}
            className="flex-1 text-sm px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700"
          >
            Details
          </button>
          <button
            onClick={() => onToggleWatchlist(anime)}
            className={`text-sm px-3 py-2 rounded-lg ${inWatchlist ? 'bg-teal-700 hover:bg-teal-600' : 'bg-indigo-600 hover:bg-indigo-500'}`}
          >
            {inWatchlist ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
