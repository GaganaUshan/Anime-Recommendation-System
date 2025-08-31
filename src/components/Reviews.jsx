import { useEffect, useState } from 'react';
import useLocalStorage from '../useLocalStorage';

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => onChange(n)} aria-label={`Rate ${n}`}
          className={`text-2xl leading-none ${n <= value ? '' : 'opacity-30'}`}>★</button>
      ))}
    </div>
  )
}

export default function Reviews({ animeId }) {
  const storageKey = `reviews:${animeId}`;
  const [list, setList] = useLocalStorage(storageKey, []);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  function addReview() {
    if (!rating && !comment.trim()) return;
    const item = { rating, comment: comment.trim(), ts: Date.now() };
    setList([item, ...list]);
    setRating(5);
    setComment('');
  }

  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2">Your Reviews</h4>
      <div className="flex items-center gap-2 mb-2">
        <Stars value={rating} onChange={setRating} />
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a short comment…"
          className="flex-1 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700"
        />
        <button onClick={addReview} className="px-3 py-2 rounded-lg bg-teal-700 hover:bg-teal-600">Add</button>
      </div>
      {list.length === 0 ? (
        <div className="text-sm text-gray-400">No reviews yet.</div>
      ) : (
        <ul className="space-y-2">
          {list.map((r, i) => (
            <li key={i} className="p-3 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="text-yellow-300">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                <div className="text-xs text-gray-500">{new Date(r.ts).toLocaleString()}</div>
              </div>
              {r.comment && <div className="mt-2">{r.comment}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
