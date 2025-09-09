// components/results/ResultsOverview.jsx

import React from 'react';

const ResultsOverview = ({ siteData }) => {
  if (siteData.error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded">
        <div className="text-red-700">Error: {siteData.error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fetch Summary */}
      {siteData.fetch_summary && (
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3">📊 Fetch Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><strong>Total Requests:</strong> {siteData.fetch_summary.total_requests}</div>
            <div><strong>Successful:</strong> {siteData.fetch_summary.successful_requests}</div>
            <div><strong>Failed:</strong> {siteData.fetch_summary.failed_requests}</div>
            <div><strong>Data Points:</strong> {siteData.fetch_summary.data_points}</div>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            <strong>Duration:</strong> {siteData.fetch_summary.start_time} → {siteData.fetch_summary.end_time}
          </div>
        </div>
      )}

      {/* GFA Region Info */}
      {siteData.gfa_region && (
        <div className="bg-green-50 p-4 rounded border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">🗺️ GFA Region</h4>
          <div className="text-sm text-green-700">
            <strong>Region:</strong> {siteData.gfa_region} | <strong>Site:</strong> {siteData.site}
          </div>
        </div>
      )}

      {/* Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">📋 Alphanumeric Data</h4>
          <div className="text-sm text-green-700">
            <strong>Types:</strong> {siteData.alpha_data ? Object.keys(siteData.alpha_data).length : 0}<br/>
            <strong>Categories:</strong> {siteData.alpha_data ? Object.keys(siteData.alpha_data).join(', ') : 'None'}
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-2">🗺️ Image Data</h4>
          <div className="text-sm text-purple-700">
            <strong>Types:</strong> {siteData.image_data ? Object.keys(siteData.image_data).length : 0}<br/>
            <strong>Categories:</strong> {siteData.image_data ? Object.keys(siteData.image_data).join(', ') : 'None'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsOverview;
