// components/results/ImageResults.jsx

import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import ImageCategoryResults from './ImageCategoryResults.jsx';
import { categoryNames } from '../../utils/constants/dataTypes.js';

const ImageResults = ({ imageData }) => {
  const [activeImageCategory, setActiveImageCategory] = useState('');

  if (!imageData || Object.keys(imageData).length === 0) {
    return <p className="text-gray-500">No image data available.</p>;
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
    return <p className="text-gray-500">No categorized image data available.</p>;
  }

  const firstCategory = Object.keys(categories)[0];
  if (!activeImageCategory || !categories[activeImageCategory]) {
    setActiveImageCategory(firstCategory);
  }

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b">
        {Object.keys(categories).map(category => (
          <button
            key={category}
            onClick={() => setActiveImageCategory(category)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeImageCategory === category
                ? 'bg-purple-600 text-white border-b-2 border-purple-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {categoryNames[category]} ({Object.keys(categories[category]).length})
          </button>
        ))}
      </div>

      {/* Category Content */}
      <div className="space-y-6">
        {Object.entries(categories[activeImageCategory] || {}).map(([imageType, imageData]) => (
          <div key={imageType} className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              {imageType}
              {imageData.error && <span className="text-red-500">❌</span>}
            </h4>
            <ImageCategoryResults imageData={imageData} imageType={imageType} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageResults;
