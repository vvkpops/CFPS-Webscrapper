// src/components/strip/GfaDisplay.jsx
import React, { useState, useMemo } from 'react';

const GfaDisplay = ({ imageData }) => {
  const [activeImageType, setActiveImageType] = useState('CLDWX');
  const [activePeriod, setActivePeriod] = useState('000');

  const gfaData = useMemo(() => {
    const data = {};
    if (!imageData) return data;

    Object.entries(imageData).forEach(([key, value]) => {
      // The key will be like 'GFA/CLDWX' or 'GFA/TURBC'
      if (key.startsWith('GFA/') && value) {
        const type = key.split('/')[1]; // e.g., 'CLDWX'
        // The API might return images directly under the value, or nested inside a 'data' object that is an array
        let images = [];
        if (value.images && Array.isArray(value.images)) {
          // Shape: { images: [...] }
          images = value.images;
        } else if (value.data && Array.isArray(value.data)) {
          // Shape: { data: [{... images: [...] }] }
          const gfaObject = value.data.find(d => d.images && Array.isArray(d.images));
          if (gfaObject) {
            images = gfaObject.images;
          }
        }
        
        if (images.length > 0) {
          data[type] = images;
        }
      }
    });
    return data;
  }, [imageData]);

  const availableTypes = Object.keys(gfaData);
  const imagesForType = gfaData[activeImageType] || [];
  const activeImage = imagesForType.find(img => img.period === activePeriod);

  // If no GFA data at all, don't render the component
  if (availableTypes.length === 0) {
    return null;
  }
  
  // Set a default active type if the current one isn't available
  if (availableTypes.length > 0 && !gfaData[activeImageType]) {
    setActiveImageType(availableTypes[0]);
  }
  
  // Set a default active period if the current one isn't available for the selected type
  if (imagesForType.length > 0 && !activeImage) {
      setActivePeriod(imagesForType[0].period);
  }

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-800">GFA</h2>
        <div className="flex items-center gap-2">
          {availableTypes.map(type => (
            <button
              key={type}
              onClick={() => setActiveImageType(type)}
              className={`px-3 py-1 text-sm font-medium rounded ${
                activeImageType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {type === 'CLDWX' ? 'Cloud' : 'Icing'}
            </button>
          ))}
        </div>
      </div>
      
      {activeImage ? (
        <img
          src={activeImage.proxy_url}
          alt={`GFA ${activeImageType} T+${activeImage.period}h`}
          className="w-full h-auto rounded border"
        />
      ) : (
        <div className="w-full bg-gray-100 border rounded flex items-center justify-center min-h-[300px]">
          <p className="text-gray-500">No GFA image available for this selection.</p>
        </div>
      )}

      <div className="flex justify-center gap-2 mt-2">
        {imagesForType.map(img => (
          <button
            key={img.period}
            onClick={() => setActivePeriod(img.period)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md ${
              activePeriod === img.period
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 border border-blue-500'
            }`}
          >
            10T{String(parseInt(img.period, 10)).padStart(2, '0')}00Z
          </button>
        ))}
      </div>
    </div>
  );
};

export default GfaDisplay;