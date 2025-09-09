// components/results/ImageCategoryResults.jsx

import React from 'react';

const ImageCategoryResults = ({ imageData, imageType }) => {
  if (imageData.error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded">
        <div className="text-red-700">Error: {imageData.error}</div>
      </div>
    );
  }

  if (imageData.type === 'direct_gfa_images') {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><strong>Product:</strong> {imageData.product}</div>
            <div><strong>Region:</strong> {imageData.gfa_region}</div>
            <div><strong>Site:</strong> {imageData.site}</div>
            <div><strong>Images:</strong> {imageData.images.length}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {imageData.images.map((img, index) => (
            <div key={index} className="bg-white border border-blue-300 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-3">📅 Forecast Period: T+{img.period}h</h5>
              <div className="relative">
                <img
                  src={img.proxy_url}
                  alt={`${imageData.product} T+${img.period}h`}
                  className="w-full h-auto rounded border"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden bg-red-50 border border-red-200 p-3 rounded text-red-700 text-sm">
                  ❌ Image failed to load
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <div><strong>Period:</strong> T+{img.period}h</div>
                <div><strong>Type:</strong> {img.content_type || 'image'}</div>
                <a href={img.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Open Original
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (imageData.data && Array.isArray(imageData.data)) {
    return (
      <div className="space-y-4">
        <div className="bg-purple-50 p-3 rounded text-sm">
          <strong>Data Items:</strong> {imageData.data.length} | <strong>Type:</strong> {imageType}
        </div>
        
        {imageData.data.map((item, index) => {
          if (item.text) {
            try {
              const parsedData = JSON.parse(item.text);
              return (
                <div key={index} className="bg-white border rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 mb-3">
                    Item {index + 1}: {parsedData.product || 'Unknown'} {parsedData.sub_product || ''}
                  </h5>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-3 rounded mb-4">
                    <div><strong>Product:</strong> {parsedData.product || 'N/A'}</div>
                    <div><strong>Sub-product:</strong> {parsedData.sub_product || 'N/A'}</div>
                    <div><strong>Geography:</strong> {parsedData.geography || 'N/A'}</div>
                    <div><strong>Validity:</strong> {item.startValidity || 'N/A'}</div>
                  </div>

                  {parsedData.frame_lists && Array.isArray(parsedData.frame_lists) && (
                    <div className="space-y-4">
                      {parsedData.frame_lists.map((frameList, flIndex) => (
                        <div key={flIndex} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                          <h6 className="font-medium text-blue-800 mb-3">
                            📅 {frameList.sv} → {frameList.ev}
                          </h6>
                          
                          {frameList.frames && Array.isArray(frameList.frames) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {frameList.frames.map((frame, fIndex) => 
                                frame.images && frame.images.map((img, iIndex) => {
                                  const imgUrl = `https://plan.navcanada.ca/weather/images/${img.id}.image`;
                                  return (
                                    <div key={`${fIndex}-${iIndex}`} className="bg-white border rounded p-3">
                                      <img
                                        src={imgUrl}
                                        alt={`${parsedData.product} ${frame.sv}-${frame.ev}`}
                                        className="w-full h-auto rounded border mb-2"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'block';
                                        }}
                                      />
                                      <div className="hidden bg-red-50 p-2 rounded text-red-700 text-xs">
                                        Image failed to load: {imgUrl}
                                      </div>
                                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                        <div><strong>Valid:</strong> {frame.sv} → {frame.ev}</div>
                                        <div><strong>ID:</strong> {img.id}</div>
                                        <div><strong>Created:</strong> {img.created}</div>
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
                <div key={index} className="bg-white border rounded p-4">
                  <h5 className="font-medium mb-2">Item {index + 1}</h5>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">{item.text}</pre>
                </div>
              );
            }
          }
          return null;
        })}
      </div>
    );
  }

  return (
    <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
      {JSON.stringify(imageData, null, 2)}
    </pre>
  );
};

export default ImageCategoryResults;
