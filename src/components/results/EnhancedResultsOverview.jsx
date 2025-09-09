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
                  <Clock className="w-4 h-4" />
                  <span>Last Updated: {new Date(siteData.fetch_summary.end_time).toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              successRate >= 80 ? 'bg-green-500 bg-opacity-20 text-green-100' :
              successRate >= 60 ? 'bg-yellow-500 bg-opacity-20 text-yellow-100' :
              'bg-red-500 bg-opacity-20 text-red-100'
            }`}>
              {successRate >= 80 ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {successRate}% Success Rate
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Database}
          title="Total Data Types"
          value={totalDataTypes}
          subtitle={`${alphaDataCount} text, ${imageDataCount} images`}
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          title="Successful Fetches"
          value={totalSuccessful}
          subtitle={`${successRate}% success rate`}
          color="green"
        />
        <StatCard
          icon={XCircle}
          title="Failed Fetches"
          value={totalFailed}
          subtitle={totalFailed > 0 ? "Check connectivity" : "All successful"}
          color="red"
        />
        <StatCard
          icon={Activity}
          title="Data Points"
          value={totalDataPoints}
          subtitle="Individual records"
          color="purple"
        />
      </div>

      {/* Fetch Summary */}
      {siteData.fetch_summary && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Fetch Performance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <ProgressBar
                value={siteData.fetch_summary.successful_requests}
                max={siteData.fetch_summary.total_requests}
                label="Success Rate"
                color="green"
              />
              <ProgressBar
                value={siteData.fetch_summary.data_points}
                max={siteData.fetch_summary.total_requests * 2}
                label="Data Density"
                color="blue"
              />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-3">Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Requests:</span>
                  <span className="font-medium">{siteData.fetch_summary.total_requests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Successful:</span>
                  <span className="font-medium text-green-600">{siteData.fetch_summary.successful_requests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Failed:</span>
                  <span className="font-medium text-red-600">{siteData.fetch_summary.failed_requests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Points:</span>
                  <span className="font-medium text-blue-600">{siteData.fetch_summary.data_points}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-xs">
                      {siteData.fetch_summary.start_time && siteData.fetch_summary.end_time ? (
                        `${Math.round((new Date(siteData.fetch_summary.end_time) - new Date(siteData.fetch_summary.start_time)) / 1000)}s`
                      ) : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Type Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-600" />
          Data Breakdown
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataTypeCard
            icon={FileText}
            title="Alphanumeric Data"
            alphaCount={alphaDataCount}
            imageCount={0}
            color="green"
          />
          <DataTypeCard
            icon={ImageIcon}
            title="Weather Imagery"
            alphaCount={0}
            imageCount={imageDataCount}
            color="purple"
          />
        </div>

        {/* Detailed Breakdown */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Alpha Data Types */}
          {siteData.alpha_data && Object.keys(siteData.alpha_data).length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Text Data Types ({Object.keys(siteData.alpha_data).length})
              </h4>
              <div className="space-y-2">
                {Object.entries(siteData.alpha_data).map(([type, data]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">{type.toUpperCase()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      data && data.error 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {data && data.error ? '❌ Failed' : '✅ OK'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Data Types */}
          {siteData.image_data && Object.keys(siteData.image_data).length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Image Data Types ({Object.keys(siteData.image_data).length})
              </h4>
              <div className="space-y-2">
                {Object.entries(siteData.image_data).map(([type, data]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">{type}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      data && data.error 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {data && data.error ? '❌ Failed' : '✅ OK'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800">Data Quality Assessment</h4>
            <p className="text-sm text-gray-600 mt-1">
              {successRate >= 90 ? '🟢 Excellent data coverage' :
               successRate >= 70 ? '🟡 Good data coverage with some gaps' :
               successRate >= 50 ? '🟠 Moderate data coverage, check connectivity' :
               '🔴 Poor data coverage, investigate issues'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-700">{successRate}%</div>
            <div className="text-xs text-gray-500">Coverage</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedResultsOverview;
