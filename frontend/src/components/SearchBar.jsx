import { useState } from "react";
import { Search } from "lucide-react"; // npm install lucide-react

export default function SearchBar() {
  const [search, setSearch] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: handle search logic here
  };

  return (
    <div className="bg-white w-full flex justify-center py-2 sm:py-4 fixed top-16 left-0 right-0 z-50 shadow-lg">
      <form
        className="relative flex w-full max-w-xs sm:max-w-xl px-2 sm:px-0"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search vehicles, brands, models..."
          className="w-full pl-10 pr-12 py-2 sm:py-3 rounded-full border border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 transition-all duration-200 text-sm sm:text-base"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
          <Search size={20} />
        </span>
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow transition-all duration-200"
        >
          <Search size={18} />
        </button>
      </form>
    </div>
  );
}
