// components/results/WeatherImageryViewer.jsx

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Minus
} from 'lucide-react';

const WeatherImageryViewer = ({ imageData, getDataStatus }) => {
  const [selectedCategory, setSelectedCategory] = useState('');

  if (!imageData || Object.keys(imageData).length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Image Data</h3>
        <p className="text-gray-500">No weather imagery available</p>
      </div>
    );
  }

  // Categorize images
  const categories = {
    satellite: {},
    radar: {},
    gfa: {},
    sigwx: {}
  };

  Object.entries(imageData).forEach(([key, data]) => {
    if (key.includes('SATELLITE')) categories.satellite[key] = data;
    else if (key.includes('RADAR')) categories.radar[key] = data;
    else if (key.includes('GFA')) categories.gfa[key] = data;
    else if (key.includes('SIG_WX')) categories.sigwx[key] = data;
  });

  const availableCategories = Object.entries(categories).filter(([key, data]) => Object.keys(data).length > 0);

  if (!selectedCategory && availableCategories.length > 0) {
    setSelectedCategory(availableCategories[0][0]);
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 border-b">
        {availableCategories.map(([category, data]) => {
          const categoryIcons = {
            satellite: '🛰️',
            radar: '📡',
            gfa: '🗺️',
            sigwx: '⚡'
          };
          
          const categoryNames = {
            satellite: 'Satellite',
            radar: 'Radar',
            gfa: 'GFA Charts',
            sigwx: 'Significant Weather'
          };

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{categoryIcons[category]}</span>
              {categoryNames[category]}
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                {Object.keys(data).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Content */}
      <div className="space-y-4">
        {Object.entries(categories[selectedCategory] || {}).map(([imageType, data]) => {
          const status = getDataStatus(data);
          const Icon = status.icon;

          return (
            <div key={imageType} className="border border-gray-300 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-800">{imageType}</h4>
                    <div className={`flex items-center gap-1 ${status.color}`}>
                      <Icon className="w-4 h-4" />
                      <span className="font-bold text-sm">{status.text}</span>
                    </div>
                  </div>
                  {data?.images && (
                    <span className="text-sm text-gray-600">
                      {data.images.length} image{data.images.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {data?.error ? (
                  <div className="bg-red-50 border border-red-200 p-4 rounded text-red-700">
                    Error: {data.error}
                  </div>
                ) : data?.images && data.images.length > 0 ? (
                  <ImageViewer 
                    images={data.images} 
                    imageType={imageType}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No images available for this type
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Image Viewer Component with GFA Support
const ImageViewer = ({ images, imageType }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [gfaMode, setGfaMode] = useState('clouds'); // 'clouds' or 'icing'

  // Check if this is GFA data and organize by clouds/icing
  const isGFA = imageType.includes('GFA');
  
  let displayImages = images;
  
  if (isGFA) {
    // Separate GFA images into clouds and icing
    const cloudsImages = images.filter(img => 
      img.type === 'clouds' || 
      img.product === 'cldwx' || 
      (!img.type && !img.product && images.indexOf(img) < Math.ceil(images.length / 2))
    );
    
    const icingImages = images.filter(img => 
      img.type === 'icing' || 
      img.product === 'turbc' || 
      (!img.type && !img.product && images.indexOf(img) >= Math.ceil(images.length / 2))
    );
    
    displayImages = gfaMode === 'clouds' ? cloudsImages : icingImages;
  }

  const currentImage = displayImages[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const resetIndex = () => {
    setCurrentImageIndex(0);
  };

  // Reset index when switching GFA modes
  useEffect(() => {
    resetIndex();
  }, [gfaMode]);

  if (!currentImage) {
    return (
      <div className="text-center py-8 text-gray-500">
        No images available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* GFA Mode Toggle */}
      {isGFA && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setGfaMode('clouds')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              gfaMode === 'clouds'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ☁️ Clouds & Weather
          </button>
          <button
            onClick={() => setGfaMode('icing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              gfaMode === 'icing'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🧊 Icing & Turbulence
          </button>
        </div>
      )}

      {/* Image Display Area */}
      <div className="flex flex-col items-center space-y-4">
        {/* Image Container */}
        <div className="relative">
          <div className="w-[650px] h-[650px] bg-gray-900 rounded-lg border-4 border-gray-700 flex items-center justify-center overflow-hidden">
            {currentImage.url || currentImage.proxy_url ? (
              <img
                src={currentImage.proxy_url || currentImage.url}
                alt={`${imageType} - ${currentImage.period || currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            
            {/* Fallback placeholder */}
            <div className="flex flex-col items-center justify-center text-gray-400" style={{ display: (currentImage.url || currentImage.proxy_url) ? 'none' : 'flex' }}>
              <div className="text-6xl mb-4">🖼️</div>
              <div className="text-lg font-medium">Weather Image</div>
              <div className="text-sm">
                {isGFA ? `${gfaMode.charAt(0).toUpperCase() + gfaMode.slice(1)} - ` : ''}
                {currentImage.period ? `T+${currentImage.period}h` : `Image ${currentImageIndex + 1}`}
              </div>
            </div>
          </div>

          {/* Image Info Overlay */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg">
            <div className="font-mono text-sm">
              {isGFA && (
                <div className="flex items-center gap-2 mb-1">
                  <span>{gfaMode === 'clouds' ? '☁️' : '🧊'}</span>
                  <span>{gfaMode === 'clouds' ? 'CLOUDS' : 'ICING'}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {currentImage.period ? `T+${currentImage.period}H` : `IMG ${currentImageIndex + 1}`}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-75 text-white p-3 rounded-full hover:bg-opacity-90 transition-all"
                disabled={displayImages.length <= 1}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-75 text-white p-3 rounded-full hover:bg-opacity-90 transition-all"
                disabled={displayImages.length <= 1}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Image Counter and Info */}
        <div className="flex items-center justify-between w-[650px]">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {displayImages.length > 1 && (
              <span className="font-mono">
                {currentImageIndex + 1} / {displayImages.length}
              </span>
            )}
            {currentImage.period && (
              <span>
                Forecast: T+{currentImage.period}h
              </span>
            )}
            {currentImage.created && (
              <span>
                Created: {new Date(currentImage.created).toLocaleString()}
              </span>
            )}
          </div>

          {/* Time Period Indicators */}
          {displayImages.length > 1 && displayImages.length <= 6 && (
            <div className="flex gap-1">
              {displayImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentImageIndex
                      ? 'bg-blue-600'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherImageryViewer;
