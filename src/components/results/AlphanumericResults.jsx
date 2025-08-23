// components/results/AlphanumericResults.jsx

import React from 'react';
import { FileText } from 'lucide-react';

const AlphanumericResults = ({ alphaData, activeSite }) => {
  if (!alphaData || Object.keys(alphaData).length === 0) {
    return <p className="text-gray-500">No alphanumeric data available.</p>;
  }

  return (
    <div className="space-y-4">
      {Object.entries(alphaData).map(([alphaType, data]) => (
        <div key={alphaType} className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {alphaType.toUpperCase()}
            {data.error && <span className="text-red-500">❌</span>}
          </h4>
          
          {data.error ? (
            <div className="bg-red-50 border border-red-200 p-3 rounded text-red-700">
              Error: {data.error}
            </div>
          ) : data.data && Array.isArray(data.data) ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 bg-white p-2 rounded">
                <strong>Data Items:</strong> {data.data.length} | <strong>Site:</strong> {activeSite}
              </div>
              {data.data.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded border">
                  <div className="flex justify-between items-center mb-2 text-xs text-gray-500">
                    <span>Item {index + 1} | ID: {item.pk || 'N/A'}</span>
                    <span>{item.startValidity || 'No timestamp'}</span>
                  </div>
                  {item.text && (
                    <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                      {item.text}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
};

export default AlphanumericResults;
