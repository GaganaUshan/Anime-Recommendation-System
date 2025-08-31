export default function SearchBar({ onSearch, initial='' }) {
  let inputRef = null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = inputRef?.value?.trim();
        if (q) onSearch(q);
      }}
      className="w-full flex gap-2"
    >
      <input
        ref={(r) => (inputRef = r)}
        defaultValue={initial}
        placeholder="Search anime (e.g., Jujutsu Kaisen, One Piece)"
        className="flex-1 px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 font-semibold"
      >
        Search
      </button>
    </form>
  );
}
