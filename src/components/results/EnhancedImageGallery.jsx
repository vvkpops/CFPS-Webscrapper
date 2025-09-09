// components/results/EnhancedImageGallery.jsx

import React, { useState } from 'react';
import { Clock, MapPin, Maximize2 } from 'lucide-react';
import EnhancedImageViewer from './EnhancedImageViewer.jsx';
import Button from '../common/Button.jsx';

const EnhancedImageGallery = ({ imageData, imageType, title }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');

  if (imageData.error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <div className="text-red-700 font-medium">Error Loading Images</div>
        <div className="text-red-600 text-sm mt-1">{imageData.error}</div>
      </div>
    );
  }

  // Handle direct GFA images
  if (imageData.type === 'direct_gfa_images') {
    const openViewer = (startIndex = 0) => {
      setSelectedImages(imageData.images);
      setSelectedTitle(`${imageData.product.toUpperCase()} - ${imageData.gfa_region}`);
      setViewerOpen(true);
    };

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {imageData.product.toUpperCase()} - {imageData.gfa_region}
              </h4>
              <p className="text-sm text-blue-600 mt-1">
                {imageData.images.length} forecast periods available
              </p>
            </div>
            <Button
              onClick={() => openViewer(0)}
              variant="primary"
              icon={Maximize2}
              size="sm"
            >
              View Timeline
            </Button>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {imageData.images.map((img, index) => (
            <div
              key={index}
              className="group relative bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => openViewer(index)}
            >
              {/* Time Period Badge */}
              <div className="absolute top-2 left-2 z-10">
                <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  T+{img.period}h
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 z-5 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </div>

              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={img.proxy_url}
                  alt={`${imageData.product} T+${img.period}h`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.target.parentElement.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                        <div class="text-center">
                          <div class="text-2xl mb-2">📡</div>
                          <div class="text-xs">Image Unavailable</div>
                        </div>
                      </div>
                    `;
                  }}
                />
              </div>

              {/* Info Bar */}
              <div className="p-3 bg-gray-50 border-t">
                <div className="text-xs text-gray-600">
                  <div className="font-medium">{img.content_type || 'Image'}</div>
                  <div>Forecast Period: T+{img.period}h</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <EnhancedImageViewer
          images={selectedImages}
          title={selectedTitle}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </div>
    );
  }

  // Handle regular image data with frame lists
  if (imageData.data && Array.isArray(imageData.data)) {
    return (
      <div className="space-y-6">
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-purple-800">
                {imageData.data.length} data items • {imageType}
              </span>
            </div>
          </div>
        </div>

        {imageData.data.map((item, index) => {
          if (item.text) {
            try {
              const parsedData = JSON.parse(item.text);
              
              // Collect all images from frame lists
              let allImages = [];
              if (parsedData.frame_lists && Array.isArray(parsedData.frame_lists)) {
                parsedData.frame_lists.forEach((frameList, flIndex) => {
                  if (frameList.frames && Array.isArray(frameList.frames)) {
                    frameList.frames.forEach((frame, fIndex) => {
                      if (frame.images && frame.images) {
                        frame.images.forEach((img, iIndex) => {
                          const imgUrl = `https://plan.navcanada.ca/weather/images/${img.id}.image`;
                          allImages.push({
                            url: imgUrl,
                            proxy_url: imgUrl, // These might not need proxy
                            period: `${frame.sv}-${frame.ev}`,
                            created: img.created,
                            id: img.id,
                            frameList: flIndex,
                            frame: fIndex,
                            image: iIndex
                          });
                        });
                      }
                    });
                  }
                });
              }

              const openViewer = (startIndex = 0) => {
                setSelectedImages(allImages);
                setSelectedTitle(`${parsedData.product || 'Weather'} ${parsedData.sub_product || ''}`);
                setViewerOpen(true);
              };

              return (
                <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-semibold text-gray-800">
                          {parsedData.product || 'Unknown'} {parsedData.sub_product || ''}
                        </h5>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>Geography: {parsedData.geography || 'N/A'}</span>
                          <span>Validity: {item.startValidity || 'N/A'}</span>
                          <span>{allImages.length} images</span>
                        </div>
                      </div>
                      {allImages.length > 0 && (
                        <Button
                          onClick={() => openViewer(0)}
                          variant="primary"
                          icon={Maximize2}
                          size="sm"
                        >
                          View All
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Frame Lists */}
                  {parsedData.frame_lists && Array.isArray(parsedData.frame_lists) && (
                    <div className="p-4 space-y-4">
                      {parsedData.frame_lists.map((frameList, flIndex) => (
                        <div key={flIndex} className="bg-blue-50 rounded-lg p-4">
                          <h6 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {frameList.sv} → {frameList.ev}
                          </h6>
                          
                          {frameList.frames && Array.isArray(frameList.frames) && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {frameList.frames.map((frame, fIndex) => 
                                frame.images && frame.images.map((img, iIndex) => {
                                  const imgUrl = `https://plan.navcanada.ca/weather/images/${img.id}.image`;
                                  const imageIndex = allImages.findIndex(ai => ai.id === img.id);
                                  
                                  return (
                                    <div
                                      key={`${fIndex}-${iIndex}`}
                                      className="group relative bg-white border rounded-lg overflow-hidden hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer"
                                      onClick={() => openViewer(imageIndex)}
                                    >
                                      {/* Hover Overlay */}
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 z-10 flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                          <Maximize2 className="w-6 h-6 text-white drop-shadow-lg" />
                                        </div>
                                      </div>

                                      <div className="aspect-[4/3] overflow-hidden">
                                        <img
                                          src={imgUrl}
                                          alt={`${parsedData.product} ${frame.sv}-${frame.ev}`}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                          onError={(e) => {
                                            e.target.parentElement.innerHTML = `
                                              <div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                                                <div class="text-center">
                                                  <div class="text-lg mb-1">📡</div>
                                                  <div class="text-xs">Failed to Load</div>
                                                </div>
                                              </div>
                                            `;
                                          }}
                                        />
                                      </div>
                                      
                                      <div className="p-2 bg-gray-50 border-t">
                                        <div className="text-xs text-gray-600">
                                          <div className="font-medium">{frame.sv} - {frame.ev}</div>
                                          <div>ID: {img.id}</div>
                                          <div>{img.created}</div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            } catch (e) {
              return (
                <div key={index} className="bg-white border rounded-lg p-4">
                  <h5 className="font-medium mb-2">Item {index + 1}</h5>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                    {item.text}
                  </pre>
                </div>
              );
            }
          }
          return null;
        })}

        <EnhancedImageViewer
          images={selectedImages}
          title={selectedTitle}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </div>
    );
  }

  // Fallback for unknown data format
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h5 className="font-medium text-gray-700 mb-2">Raw Image Data</h5>
      <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
        {JSON.stringify(imageData, null, 2)}
      </pre>
    </div>
  );
};

export default EnhancedImageGallery;
