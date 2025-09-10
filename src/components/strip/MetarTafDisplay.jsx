// src/components/strip/MetarTafDisplay.jsx
import React from 'react';
import { parseRawAlpha } from '../../utils/parsers/alphaParsers';

const MetarTafDisplay = ({ data, title }) => {
  if (!data || data.error || !data.data || data.data.length === 0) {
    return null;
  }

  // Handle both array of objects and single object with raw text
  const items = Array.isArray(data.data) ? data.data : [data];

  return (
    <div className="py-4">
      <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
      <div className="font-mono text-sm bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
        {items.map((item, index) => (
          <pre key={index} className="whitespace-pre-wrap">{parseRawAlpha(item)}</pre>
        ))}
      </div>
    </div>
  );
};

export default MetarTafDisplay;