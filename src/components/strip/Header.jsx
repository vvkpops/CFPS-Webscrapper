// src/components/strip/Header.jsx
import React, { useState } from 'react';
import { Search, Menu } from 'lucide-react';

const Header = ({ onSearch, initialSite }) => {
  const [site, setSite] = useState(initialSite);

  const handleSearch = (e) => {
    e.preventDefault();
    if (site.trim()) {
      onSearch(site.trim().toUpperCase());
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12L6.41421 8.58579C7.19526 7.80474 8.46159 7.80474 9.24264 8.58579L12.5 11.8431L15.7574 8.58579C16.5384 7.80474 17.8047 7.80474 18.5858 8.58579L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="ml-2 text-xl font-bold text-gray-800">Weather Strip</span>
          </div>
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
            <form onSubmit={handleSearch} className="max-w-md w-full lg:max-w-xs">
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
          <div className="flex items-center ml-4">
            <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              <Menu />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;