// components/progress/StatisticsPanel.jsx

import React from 'react';
import Card from '../common/Card.jsx';

const StatisticsPanel = ({ stats, isVisible }) => {
  if (!isVisible) return null;

  const avgResponseTime = stats.responseTimes.length > 0 ? 
    Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length) : 0;

  return (
    <Card title="📊 Scraping Statistics" borderColor="green-500" className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Requests</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
          <div className="text-sm text-gray-600">Successful</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.dataPoints}</div>
          <div className="text-sm text-gray-600">Data Points</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{avgResponseTime}</div>
          <div className="text-sm text-gray-600">Avg Response (ms)</div>
        </div>
      </div>
    </Card>
  );
};

export default StatisticsPanel;
