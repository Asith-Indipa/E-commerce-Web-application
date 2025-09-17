import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [search, setSearch] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: handle search logic here
  };

  return (
    <div className="flex justify-center py-4 fixed top-16 left-0 right-0 z-50">
      <form
        className="relative flex w-full max-w-xl"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search vehicles, brands, models..."
          className="w-full pl-10 pr-12 py-3 rounded-full border-2 border-blue-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-300 shadow-lg text-gray-700 transition-all duration-200 text-base"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
          <Search size={20} />
        </span>
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow transition-all duration-200"
        >
          <Search size={18} />
        </button>
      </form>
    </div>
  );
}
