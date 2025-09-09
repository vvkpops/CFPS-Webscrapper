// components/results/EnhancedResultsOverview.jsx

import React from 'react';
import { 
  MapPin, 
  Clock, 
  Database, 
  CheckCircle, 
  XCircle, 
  Activity,
  FileText,
  Image as ImageIcon,
  TrendingUp
} from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend }) => (
  <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 border border-${color}-200 rounded-lg p-4 hover:shadow-md transition-shadow`}>
    <div className="flex items-center justify-between mb-2">
      <Icon className={`w-6 h-6 text-${color}-600`} />
      {trend && (
        <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className="w-3 h-3" />
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
    <div className={`text-2xl font-bold text-${color}-900 mb-1`}>{value}</div>
    <div className="text-sm text-gray-600">{title}</div>
    {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
  </div>
);

const ProgressBar = ({ value, max, label, color = 'blue' }) => {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-600">{value}/{max} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const DataTypeCard = ({ icon: Icon, title, alphaCount, imageCount, color = 'gray' }) => (
  <div className={`bg-white border border-${color}-200 rounded-lg p-4 hover:border-${color}-400 transition-colors`}>
    <div className="flex items-center gap-3 mb-3">
      <Icon className={`w-5 h-5 text-${color}-600`} />
      <h4 className="font-semibold text-gray-800">{title}</h4>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Text Reports</span>
        <span className="font-medium">{alphaCount}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Images</span>
        <span className="font-medium">{imageCount}</span>
      </div>
    </div>
  </div>
);

const EnhancedResultsOverview = ({ siteData }) => {
  if (siteData.error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <XCircle className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-800">Fetch Error</h3>
        </div>
        <p className="text-red-700">{siteData.error}</p>
      </div>
    );
  }

  // Calculate statistics
  const alphaDataCount = siteData.alpha_data ? Object.keys(siteData.alpha_data).length : 0;
  const imageDataCount = siteData.image_data ? Object.keys(siteData.image_data).length : 0;
  const totalDataTypes = alphaDataCount + imageDataCount;

  // Count successful vs failed requests
  let alphaSuccessful = 0;
  let alphaFailed = 0;
  let imageSuccessful = 0;
  let imageFailed = 0;

  if (siteData.alpha_data) {
    Object.values(siteData.alpha_data).forEach(data => {
      if (data && data.error) {
        alphaFailed++;
      } else {
        alphaSuccessful++;
      }
    });
  }

  if (siteData.image_data) {
    Object.values(siteData.image_data).forEach(data => {
      if (data && data.error) {
        imageFailed++;
      } else {
        imageSuccessful++;
      }
    });
  }

  const totalSuccessful = alphaSuccessful + imageSuccessful;
  const totalFailed = alphaFailed + imageFailed;
  const successRate = totalDataTypes > 0 ? Math.round((totalSuccessful / totalDataTypes) * 100) : 0;

  // Calculate data points
  let totalDataPoints = 0;
  if (siteData.alpha_data) {
    Object.values(siteData.alpha_data).forEach(data => {
      if (data && data.data && Array.isArray(data.data)) {
        totalDataPoints += data.data.length;
      } else if (data && !data.error) {
        totalDataPoints += 1;
      }
    });
  }

  if (siteData.image_data) {
    Object.values(siteData.image_data).forEach(data => {
      if (data && data.data && Array.isArray(data.data)) {
        totalDataPoints += data.data.length;
      } else if (data && data.images && Array.isArray(data.images)) {
        totalDataPoints += data.images.length;
      } else if (data && !data.error) {
        totalDataPoints += 1;
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Site Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{siteData.site || 'Unknown Site'}</h2>
            <div className="flex items-center gap-4 text-blue-100">
              {siteData.gfa_region && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>GFA Region: {siteData.gfa_region}</span>
                </div>
              )}
              {siteData.fetch_summary?.end_time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-
