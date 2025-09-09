// components/results/EnhancedImageResults.jsx

import React, { useState } from 'react';
import { Image as ImageIcon, Grid, List } from 'lucide-react';
import EnhancedImageGallery from './EnhancedImageGallery.jsx';
import { categoryNames } from '../../utils/constants/dataTypes.js';
import Button from '../common/Button.jsx';

const EnhancedImageResults = ({ imageData }) => {
  const [activeImageCategory, setActiveImageCategory] = useState('');
  const [viewMode, setViewMode] = useState('gallery'); // 'gallery' or 'list'

  if (!imageData || Object.keys(imageData).length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 text-lg">No image data available</p>
        <p className="text-gray-400 text-sm">Run a fetch operation to see weather imagery</p>
      </div>
    );
  }

  const getImageCategories = (imageData) => {
    const categories = {};
    Object.keys(imageData).forEach(key => {
      if (key.includes('SATELLITE')) {
        if (!categories.satellite) categories.satellite = {};
        categories.satellite[key] = imageData[key];
      } else if (key.includes('RADAR')) {
        if (!categories.radar) categories.radar = {};
        categories.radar[key] = imageData[key];
      } else if (key.includes('GFA')) {
        if (!categories.gfa) categories.gfa = {};
        categories.gfa[key] = imageData[key];
      } else if (key.includes('SIG_WX') || key.includes('PROG_CHARTS')) {
        if (!categories.sigwx) categories.sigwx = {};
        categories.sigwx[key] = imageData[key];
      }
    });
    return categories;
  };

  const categories = getImageCategories(imageData);

  if (Object.keys(categories).length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No categorized image data available</p>
      </div>
    );
  }

  const firstCategory = Object.keys(categories)[0];
  if (!activeImageCategory || !categories[activeImageCategory]) {
    setActiveImageCategory(firstCategory);
  }

  return (
    <div className="space-y-6">
      {/* Header with View Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Weather Imagery
        </h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setViewMode('gallery')}
            variant={viewMode === 'gallery' ? 'primary' : 'secondary'}
            size="sm"
            icon={Grid}
          >
            Gallery
          </Button>
          <Button
            onClick={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            icon={List}
          >
            List
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b-2 border-gray-200 pb-2">
        {Object.keys(categories).map(category => {
          const count = Object.keys(categories[category]).length;
          const categoryColor = {
            satellite: 'bg-blue-600 hover:bg-blue-700',
            radar: 'bg-green-600 hover:bg-green-700', 
            gfa: 'bg-purple-600 hover:bg-purple-700',
            sigwx: 'bg-orange-600 hover:bg-orange-700'
          }[category] || 'bg-gray-600 hover:bg-gray-700';

          return (
            <button
              key={category}
              onClick={() => setActiveImageCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeImageCategory === category
                  ? `${categoryColor} text-white shadow-lg transform scale-105`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
            >
              <span className="text-lg">
                {category === 'satellite' && '🛰️'}
                {category === 'radar' && '📡'}
                {category === 'gfa' && '🗺️'}
                {category === 'sigwx' && '⚡'}
              </span>
              {categoryNames[category]}
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                activeImageCategory === category ? 'bg-white bg-opacity-20' : 'bg-gray-300 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Content */}
      <div className="min-h-[400px]">
        {Object.entries(categories[activeImageCategory] || {}).map(([imageType, imageData]) => (
          <div key={imageType} className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-800 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-gray-600" />
                    <span>{imageType}</span>
                  </div>
                  {imageData.error && (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                      ❌ Error
                    </span>
                  )}
                  {!imageData.error && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      ✅ Loaded
                    </span>
                  )}
                </h4>
              </div>
              <div className="p-6">
                <EnhancedImageGallery 
                  imageData={imageData} 
                  imageType={imageType}
                  title={imageType}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedImageResults;
