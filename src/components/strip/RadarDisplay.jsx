// src/components/strip/RadarDisplay.jsx
import React, { useState, useMemo } from 'react';

const RadarDisplay = ({ imageData }) => {
  const [activeType, setActiveType] = useState('COMPOSITE');

  const radarData = useMemo(() => {
    const data = {};
    if (!imageData) return data;
    Object.entries(imageData).forEach(([key, value]) => {
      // Key is 'RADAR/COMPOSITE', etc.
      if (key.startsWith('RADAR/') && value && !value.error) {
        const type = key.split('/')[1]; // e.g., 'COMPOSITE'
        
        // The API returns the actual image info inside a JSON string in the 'text' property of the first data item.
        if (value.data && Array.isArray(value.data) && value.data.length > 0 && value.data[0].text) {
          try {
            const parsedText = JSON.parse(value.data[0].text);
            
            // The image ID is deeply nested. This finds the first available image.
            const imageInfo = parsedText?.frame_lists?.[0]?.frames?.[0]?.images?.[0];
            
            if (imageInfo?.id) {
              data[type] = {
                imageUrl: `https://plan.navcanada.ca/weather/images/${imageInfo.id}.image`,
                timestamp: imageInfo.created,
              };
            }
          } catch (e) {
            console.error(`Failed to parse radar data JSON for ${type}:`, e);
          }
        }
      }
    });
    return data;
  }, [imageData]);

  const availableTypes = Object.keys(radarData);
  const activeRadar = radarData[activeType];

  if (availableTypes.length === 0) return null;

  // Default to the first available type if the current selection is not found
  if (availableTypes.length > 0 && !radarData[activeType]) {
    setActiveType(availableTypes[0]);
  }

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-800">Radar</h2>
        <div className="flex items-center gap-2">
          {availableTypes.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3 py-1 text-sm font-medium rounded ${
                activeType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {type === 'COMPOSITE' ? 'EchoTop' : type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
      
      {activeRadar ? (
        <div>
          <img
            src={activeRadar.imageUrl}
            alt={`Radar ${activeType}`}
            className="w-full h-auto rounded border bg-gray-100"
          />
          <div className="text-center text-sm text-gray-600 mt-2">
            {new Date(activeRadar.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}Z
          </div>
        </div>
      ) : (
        <div className="w-full bg-gray-100 border rounded flex items-center justify-center min-h-[300px]">
          <p className="text-gray-500">No radar image available.</p>
        </div>
      )}
    </div>
  );
};

export default RadarDisplay;