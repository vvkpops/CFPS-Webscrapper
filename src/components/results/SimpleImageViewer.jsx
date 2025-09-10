// src/components/results/SimpleImageViewer.jsx

import React, { useState } from 'react';
import { Image as ImageIcon, AlertTriangle, ExternalLink, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const SimpleImageViewer = ({ imageData }) => {
  const [selectedImage, setSelectedImage] = useState(null);
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

  // Collect ALL images from the imageData, regardless of structure
  const collectAllImages = () => {
    const allImages = [];
    
    Object.entries(imageData).forEach(([type, data]) => {
      if (!data || data.error) return;
      
      // Handle direct image array
      if (data.images && Array.isArray(data.images)) {
        data.images.forEach(img => {
          allImages.push({
            type,
            url: img.proxy_url || img.url,
            originalUrl: img.url,
            period: img.period,
            metadata: img
          });
        });
      }
      
      // Handle data array with nested images
      if (data.data && Array.isArray(data.data)) {
        data.data.forEach(item => {
          // Try to parse if it's a JSON string
          if (item.text && typeof item.text === 'string') {
            try {
              const parsed = JSON.parse(item.text);
              if (parsed.frame_lists) {
                parsed.frame_lists.forEach(frameList => {
                  if (frameList.frames) {
                    frameList.frames.forEach(frame => {
                      if (frame.images) {
                        frame.images.forEach(img => {
                          const imageUrl = `https://plan.navcanada.ca/weather/images/${img.id}.image`;
                          allImages.push({
                            type,
                            url: imageUrl,
                            originalUrl: imageUrl,
                            period: frame.sv,
                            metadata: img
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
        allImages.push({
          type,
          url: data.proxy_url || data.url,
          originalUrl: data.url,
          metadata: data
        });
      }
    });
    
    return allImages;
  };

  const images = collectAllImages();

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Valid Images Found</h3>
        <p className="text-gray-500">Images were fetched but none could be displayed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">Weather Imagery</h3>
            <p className="text-sm text-blue-700 mt-1">
              Found {images.length} image{images.length !== 1 ? 's' : ''} across {Object.keys(imageData).length} categories
            </p>
          </div>
          <ImageIcon className="w-8 h-8 text-blue-500" />
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gray-100 px-3 py-2 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">{img.type}</span>
                {img.period && (
                  <span className="text-xs text-gray-500">T+{img.period}</span>
                )}
              </div>
            </div>
            
            <div className="relative bg-gray-50 aspect-w-4 aspect-h-3">
              {!imageErrors[idx] ? (
                <img
                  src={img.url}
                  alt={`${img.type} weather imagery`}
                  className="w-full h-48 object-contain cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                  onError={() => {
                    setImageErrors(prev => ({ ...prev, [idx]: true }));
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-48 bg-red-50">
                  <div className="text-center p-4">
                    <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-xs text-red-600">Failed to load image</p>
                    <a 
                      href={img.originalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                    >
                      Try original URL
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-3 py-2 bg-white">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => window.open(img.url, '_blank')}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = img.url;
                    link.download = `${img.type}_${idx}.jpg`;
                    link.click();
                  }}
                  className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox for selected image */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage.url}
              alt={`${selectedImage.type} full view`}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleImageViewer;