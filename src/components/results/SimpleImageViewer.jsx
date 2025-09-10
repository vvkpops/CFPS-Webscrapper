// src/components/results/SimpleImageViewer.jsx

import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Clock,
  Maximize2,
  Download,
  ExternalLink
} from 'lucide-react';

const SimpleImageViewer = ({ imageData }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  if (!imageData || Object.keys(imageData).length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Image Data Available</h3>
        <p className="text-gray-500">No weather imagery was found for this station.</p>
      </div>
    );
  }

  // Process and group images by category
  const processImages = () => {
    const categories = {
      'GFA Clouds & Weather': [],
      'GFA Icing & Turbulence': [],
      'Satellite': [],
      'Radar': [],
      'Significant Weather': []
    };

    Object.entries(imageData).forEach(([type, data]) => {
      if (!data || data.error) return;

      // Extract images based on data structure
      let extractedImages = [];

      // Handle direct image array
      if (data.images && Array.isArray(data.images)) {
        extractedImages = data.images.map(img => ({
          url: img.proxy_url || img.url,
          originalUrl: img.url,
          period: img.period || extractValidTime(img),
          type: type,
          metadata: img
        }));
      }
      
      // Handle data array with nested images (GFA format)
      if (data.data && Array.isArray(data.data)) {
        data.data.forEach(item => {
          if (item.text && typeof item.text === 'string') {
            try {
              const parsed = JSON.parse(item.text);
              if (parsed.frame_lists) {
                parsed.frame_lists.forEach(frameList => {
                  if (frameList.frames) {
                    frameList.frames.forEach(frame => {
                      if (frame.images) {
                        frame.images.forEach(img => {
                          extractedImages.push({
                            url: `https://plan.navcanada.ca/weather/images/${img.id}.image`,
                            originalUrl: `https://plan.navcanada.ca/weather/images/${img.id}.image`,
                            period: frame.sv || extractValidTime(frame),
                            type: type,
                            metadata: { ...img, frameData: frame }
                          });
                        });
                      }
                    });
                  }
                });
              }
            } catch (e) {
              // Not JSON, skip
            }
          }
        });
      }
      
      // Handle single image URL
      if (data.url || data.proxy_url) {
        extractedImages.push({
          url: data.proxy_url || data.url,
          originalUrl: data.url,
          period: extractValidTime(data),
          type: type,
          metadata: data
        });
      }

      // Categorize images
      extractedImages.forEach(img => {
        if (type.includes('GFA')) {
          if (type.toLowerCase().includes('cldwx') || type.toLowerCase().includes('cloud')) {
            categories['GFA Clouds & Weather'].push(img);
          } else if (type.toLowerCase().includes('turb') || type.toLowerCase().includes('icing')) {
            categories['GFA Icing & Turbulence'].push(img);
          }
        } else if (type.includes('SATELLITE')) {
          categories['Satellite'].push(img);
        } else if (type.includes('RADAR')) {
          categories['Radar'].push(img);
        } else if (type.includes('SIG_WX') || type.includes('PROG')) {
          categories['Significant Weather'].push(img);
        }
      });
    });

    // Sort each category by valid time
    Object.keys(categories).forEach(cat => {
      categories[cat].sort((a, b) => {
        const timeA = parseValidTime(a.period);
        const timeB = parseValidTime(b.period);
        return timeA - timeB;
      });
    });

    // Remove empty categories
    const filteredCategories = {};
    Object.entries(categories).forEach(([name, images]) => {
      if (images.length > 0) {
        filteredCategories[name] = images;
      }
    });

    return filteredCategories;
  };

  // Extract valid time from various formats
  const extractValidTime = (data) => {
    if (data.period) return data.period;
    if (data.sv) return data.sv;
    if (data.startValidity) return data.startValidity;
    if (data.valid_time) return data.valid_time;
    if (data.time) return data.time;
    return '0';
  };

  // Parse valid time to number for sorting
  const parseValidTime = (timeStr) => {
    if (!timeStr) return 0;
    const str = String(timeStr);
    
    // Handle T+XX format
    if (str.startsWith('T+') || str.includes('+')) {
      const match = str.match(/\+?(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }
    
    // Handle plain numbers
    const num = parseInt(str);
    return isNaN(num) ? 0 : num;
  };

  const categorizedImages = processImages();
  const categoryNames = Object.keys(categorizedImages);

  // Initialize selected category
  useEffect(() => {
    if (!selectedCategory && categoryNames.length > 0) {
      setSelectedCategory(categoryNames[0]);
      setCurrentImageIndex(0);
    }
  }, [categoryNames, selectedCategory]);

  const currentCategoryImages = selectedCategory ? categorizedImages[selectedCategory] : [];
  const currentImage = currentCategoryImages[currentImageIndex];

  const handleNext = () => {
    if (currentImageIndex < currentCategoryImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentImageIndex(0);
    setImageErrors({});
  };

  const formatValidTime = (period) => {
    if (!period) return 'Current';
    const str = String(period);
    
    if (str.startsWith('T+') || str.includes('+')) {
      return str;
    }
    
    const num = parseInt(str);
    if (!isNaN(num)) {
      return `T+${num}H`;
    }
    
    // If it's a date/time string, try to parse it
    if (str.includes('Z') || str.includes('T')) {
      try {
        const date = new Date(str);
        if (!isNaN(date.getTime())) {
          return date.toUTCString().replace('GMT', 'Z');
        }
      } catch (e) {
        // Invalid date
      }
    }
    
    return str;
  };

  if (categoryNames.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Valid Images Found</h3>
        <p className="text-gray-500">Images were fetched but none could be displayed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Selector */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
        {categoryNames.map(category => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {category}
            <span className="ml-2 text-xs opacity-80">
              ({categorizedImages[category].length})
            </span>
          </button>
        ))}
      </div>

      {/* Image Viewer */}
      {currentImage && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">{selectedCategory}</h3>
                <span className="px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-600">
                  {currentImageIndex + 1} of {currentCategoryImages.length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {formatValidTime(currentImage.period)}
                </span>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                  title="Toggle fullscreen"
                >
                  <Maximize2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Image Display */}
          <div className="relative bg-gray-100">
            <div className="flex items-center justify-center min-h-[400px] p-4">
              {!imageErrors[currentImageIndex] ? (
                <img
                  src={currentImage.url}
                  alt={`${selectedCategory} - ${formatValidTime(currentImage.period)}`}
                  className="max-w-full max-h-[600px] object-contain cursor-pointer"
                  onClick={() => setIsFullscreen(true)}
                  onError={() => {
                    setImageErrors(prev => ({ ...prev, [currentImageIndex]: true }));
                  }}
                />
              ) : (
                <div className="text-center p-8 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-red-600 font-medium mb-2">Failed to load image</p>
                  <a 
                    href={currentImage.originalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Try original URL
                  </a>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
              <button
                onClick={handlePrevious}
                disabled={currentImageIndex === 0}
                className={`pointer-events-auto p-3 bg-white rounded-full shadow-lg transition-all ${
                  currentImageIndex === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-100 hover:scale-110'
                }`}
                title="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentImageIndex === currentCategoryImages.length - 1}
                className={`pointer-events-auto p-3 bg-white rounded-full shadow-lg transition-all ${
                  currentImageIndex === currentCategoryImages.length - 1 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-100 hover:scale-110'
                }`}
                title="Next image"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {/* Valid Time Indicator */}
              <div className="flex gap-1">
                {currentCategoryImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex 
                        ? 'bg-blue-600 w-8' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    title={`Image ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(currentImage.url, '_blank')}
                  className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = currentImage.url;
                    link.download = `${selectedCategory.replace(/\s+/g, '_')}_${formatValidTime(currentImage.period)}.jpg`;
                    link.click();
                  }}
                  className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && currentImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={currentImage.url}
              alt={`${selectedCategory} - ${formatValidTime(currentImage.period)}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            
            {/* Fullscreen Navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              disabled={currentImageIndex === 0}
              className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg ${
                currentImageIndex === 0 ? 'opacity-50' : 'hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              disabled={currentImageIndex === currentCategoryImages.length - 1}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg ${
                currentImageIndex === currentCategoryImages.length - 1 ? 'opacity-50' : 'hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Fullscreen Info */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
              <p className="text-sm font-medium">{selectedCategory}</p>
              <p className="text-xs opacity-80">
                {formatValidTime(currentImage.period)} • Image {currentImageIndex + 1} of {currentCategoryImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleImageViewer;
