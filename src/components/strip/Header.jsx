// src/components/strip/Header.jsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';

const Header = ({ onSearch, initialSite, siteName }) => {
  const [site, setSite] = useState(initialSite);

  const handleSearch = (e) => {
    e.preventDefault();
    if (site.trim()) {
      onSearch(site.trim().toUpperCase());
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              {initialSite}
              <span className="text-lg font-normal text-gray-600 ml-2">{siteName}</span>
            </h1>
          </div>
          <div className="flex-1 flex justify-end">
            <form onSubmit={handleSearch} className="max-w-xs w-full">
              <div className="relative">
                <input
                  type="text"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className="block w-full bg-gray-100 border border-gray-300 rounded-md py-2 pl-4 pr-10 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter ICAO (e.g., CYQX)"
                />
                <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;