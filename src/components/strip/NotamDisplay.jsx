// src/components/strip/NotamDisplay.jsx
import React from 'react';
import { parseRawAlpha } from '../../utils/parsers/alphaParsers';

const NotamDisplay = ({ data }) => {
  if (!data || data.error || !data.data || data.data.length === 0) {
    return null;
  }

  // Assuming data.data is an array of NOTAM objects
  const notams = data.data;

  return (
    <div className="py-4">
      <h2 className="text-xl font-bold text-gray-800 mb-2">NOTAM</h2>
      <div className="space-y-3">
        {notams.map((notam, index) => {
          const rawText = parseRawAlpha(notam);
          // Simple parsing for display
          const idMatch = rawText.match(/([A-Z0-9]+\/[0-9]{2})/);
          const id = idMatch ? idMatch[1] : `NOTAM ${index + 1}`;
          const textBody = rawText.replace(id, '').trim();

          return (
            <div key={index} className="font-mono text-sm bg-gray-50 p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <span className="font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{id}</span>
                <span className="text-gray-600">{notam.startValidity} - {notam.endValidity}</span>
              </div>
              <pre className="whitespace-pre-wrap mt-2 text-gray-800">{textBody}</pre>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotamDisplay;