// components/configuration/SimplifiedConfigurationPanel.jsx

import React from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Settings, 
  RefreshCw
} from 'lucide-react';

const SimplifiedConfigurationPanel = ({ 
  config, 
  setConfig, 
  selectedData, 
  setSelectedData,
  isExpanded, 
  setExpanded, 
  onFetch, 
  isLoading,
  lastUpdate 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b"
        onClick={() => setExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
            <span className="text-sm text-gray-500">
              ({config.primarySite} + {config.additionalSites.length} sites)
            </span>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdate && (
              <span className="text-sm text-gray-500">
                Last: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFetch();
              }}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Fetch Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Site Configuration */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Site Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Primary Site</label>
                <input
                  type="text"
                  value={config.primarySite}
                  onChange={(e) => setConfig({...config, primarySite: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="CYYT"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Additional Sites</label>
                <input
                  type="text"
                  value={config.additionalSites.join(',')}
                  onChange={(e) => setConfig({
                    ...config, 
                    additionalSites: e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="CYUL,CYVR,CYOW"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Request Delay (ms)</label>
                <input
                  type="number"
                  value={config.requestDelay}
                  onChange={(e) => setConfig({...config, requestDelay: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="100"
                  max="5000"
                />
              </div>
            </div>
          </div>

          {/* Data Selection Summary */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Data Types (All Pre-selected)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-green-800 mb-2">Text Reports ({selectedData.alpha.length})</h4>
                <div className="text-xs text-green-700 flex flex-wrap gap-1">
                  {selectedData.alpha.map(item => (
                    <span key={item} className="bg-green-100 px-2 py-1 rounded">
                      {item.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-purple-800 mb-2">Weather Images ({selectedData.image.length})</h4>
                <div className="text-xs text-purple-700 flex flex-wrap gap-1">
                  {selectedData.image.map(item => (
                    <span key={item} className="bg-purple-100 px-2 py-1 rounded">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Quick modification controls */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedData({
                    alpha: ['metar', 'taf', 'notam', 'sigmet'],
                    image: ['RADAR/COMPOSITE', 'GFA/CLDWX', 'GFA/TURBC']
                  })}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Essential Only
                </button>
                <button
                  onClick={() => setSelectedData({
                    alpha: ['metar', 'taf', 'notam', 'sigmet', 'airmet', 'pirep', 'upperwind', 'space_weather', 'vfr_route', 'area_forecast'],
                    image: ['SATELLITE/IR', 'SATELLITE/VIS', 'SATELLITE/WV', 'RADAR/COMPOSITE', 'RADAR/CAPPI_RAIN', 'GFA/CLDWX', 'GFA/TURBC', 'GFA/WINDS', 'SIG_WX/HIGH_LEVEL']
                  })}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedData({ alpha: [], image: [] })}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimplifiedConfigurationPanel;
