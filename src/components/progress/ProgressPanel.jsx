// components/progress/ProgressPanel.jsx

import React from 'react';
import Card from '../common/Card.jsx';

const ProgressPanel = ({ progress, status, isVisible, fetchProgress }) => {
  if (!isVisible) return null;

  return (
    <Card borderColor="blue-500" className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress</h3>
      
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className={`p-3 rounded ${
        status.type === 'success' ? 'bg-green-100 text-green-800' :
        status.type === 'error' ? 'bg-red-100 text-red-800' :
        status.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {status.message}
      </div>

      {fetchProgress && Object.keys(fetchProgress).length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Individual Fetch Progress</h4>
          <div className="bg-gray-50 p-4 rounded max-h-60 overflow-y-auto">
            {Object.entries(fetchProgress).map(([site, items]) => (
              <div key={site} className="mb-4">
                <h5 className="font-medium text-gray-800 mb-2">📡 {site}</h5>
                <div className="space-y-1">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{item.name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.status === 'success' ? 'bg-green-200 text-green-800' :
                        item.status === 'failed' ? 'bg-red-200 text-red-800' :
                        item.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {item.status === 'success' && `✅ ${item.responseTime}ms`}
                        {item.status === 'failed' && '❌ FAILED'}
                        {item.status === 'pending' && 'PENDING'}
                        {item.status === 'skipped' && '⭐ SKIPPED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProgressPanel;
