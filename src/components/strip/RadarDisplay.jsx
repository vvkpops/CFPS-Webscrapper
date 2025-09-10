// src/components/strip/RadarDisplay.jsx
import React, { useState, useMemo } from 'react';

const RadarDisplay = ({ imageData }) => {
  const [activeType, setActiveType] = useState('COMPOSITE');

  const radarData = useMemo(() => {
    const data = {};
    if (!imageData) return data;
    Object.entries(imageData).forEach(([key, value]) => {
      if (key.startsWith('RADAR/')) {
        const type = key.split('/')[1];
        if (value && value.data && value.data.length > 0) {
          try {
            const parsed = JSON.parse(value.data[0].text);
            if (parsed.frame_lists && parsed.frame_lists[0].frames[0].images[0]) {
              data[type] = {
                ...parsed,
                imageUrl: `https://plan.navcanada.ca/weather/images/${parsed.frame_lists[0].frames[0].images[0].id}.image`
              };
            }
          } catch (e) {
            console.error('Failed to parse radar data:', e);
          }
        }
      }
    });
    return data;
  }, [imageData]);

  const availableTypes = Object.keys(radarData);
  const activeRadar = radarData[activeType];

  if (availableTypes.length === 0) return null;

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
              {type === 'COMPOSITE' ? 'EchoTop' : type}
            </button>
          ))}
        </div>
      </div>
      
      {activeRadar ? (
        <div>
          <img
            src={activeRadar.imageUrl}
            alt={`Radar ${activeType}`}
            className="w-full h-auto rounded border"
          />
          <div className="text-center text-sm text-gray-600 mt-2">
            {new Date(activeRadar.frame_lists[0].frames[0].images[0].created).toLocaleTimeString()}
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