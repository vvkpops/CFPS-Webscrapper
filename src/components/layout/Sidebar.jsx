// src/components/layout/Sidebar.jsx

import React, { useState } from 'react';
import { 
  Settings, ChevronLeft, ChevronRight, Map, 
  FileText, Image, Cloud, Zap, RefreshCw, Play
} from 'lucide-react';

const Sidebar = ({
  config,
  setConfig,
  selectedData,
  setSelectedData,
  collapsed,
  setCollapsed,
  onFetch,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState('config');

  // Handle Enter key press on input fields
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      onFetch();
    }
  };

  return (
    <aside className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-80'
    }`}>
      <div className="h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configuration
              </h2>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Fetch Button - Always Visible */}
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${collapsed ? 'px-2' : ''}`}>
          <button
            onClick={onFetch}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              collapsed ? 'px-2' : ''
            }`}
            title="Fetch Weather Data (Press Enter)"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Play className="w-5 h-5" />
                {!collapsed && <span>Fetch Data</span>}
              </>
            )}
          </button>
          {!collapsed && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Press Enter to fetch
            </p>
          )}
        </div>

        {/* Sidebar Content */}
        {!collapsed && (
          <div className="flex-1 overflow-y-auto p-4">
            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('config')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'config'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-1" />
                Sites
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'data'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Cloud className="w-4 h-4 inline mr-1" />
                Data
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'config' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Primary Site
                  </label>
                  <input
                    type="text"
                    value={config.primarySite}
                    onChange={(e) => setConfig({...config, primarySite: e.target.value.toUpperCase()})}
                    onKeyPress={handleKeyPress}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., CYYT"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Sites
                  </label>
                  <textarea
                    value={config.additionalSites.join(', ')}
                    onChange={(e) => setConfig({
                      ...config,
                      additionalSites: e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(s => s)
                    })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                        e.preventDefault();
                        onFetch();
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="CYUL, CYVR, CYYZ"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Refresh Interval (sec)
                  </label>
                  <input
                    type="number"
                    value={config.interval}
                    onChange={(e) => setConfig({...config, interval: parseInt(e.target.value)})}
                    onKeyPress={handleKeyPress}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    min="60"
                    max="3600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Request Delay (ms)
                  </label>
                  <input
                    type="number"
                    value={config.requestDelay}
                    onChange={(e) => setConfig({...config, requestDelay: parseInt(e.target.value)})}
                    onKeyPress={handleKeyPress}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    min="100"
                    max="5000"
                  />
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-4">
                {/* Text Data Selection */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Text Reports
                  </h3>
                  <div className="space-y-2">
                    {['metar', 'taf', 'notam', 'sigmet', 'airmet', 'pirep'].map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedData.alpha.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedData({
                                ...selectedData,
                                alpha: [...selectedData.alpha, type]
                              });
                            } else {
                              setSelectedData({
                                ...selectedData,
                                alpha: selectedData.alpha.filter(t => t !== type)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {type.toUpperCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Image Data Selection */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Image className="w-4 h-4 mr-1" />
                    Weather Imagery
                  </h3>
                  <div className="space-y-2">
                    {['GFA/CLDWX', 'GFA/TURBC', 'RADAR/COMPOSITE', 'SATELLITE/IR'].map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedData.image.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedData({
                                ...selectedData,
                                image: [...selectedData.image, type]
                              });
                            } else {
                              setSelectedData({
                                ...selectedData,
                                image: selectedData.image.filter(t => t !== type)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quick Selection Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedData({
                      alpha: ['metar', 'taf', 'sigmet', 'pirep'],
                      image: ['GFA/CLDWX', 'GFA/TURBC']
                    })}
                    className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
                  >
                    <Zap className="w-4 h-4 inline mr-1" />
                    Essentials
                  </button>
                  <button
                    onClick={() => setSelectedData({
                      alpha: [],
                      image: []
                    })}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sidebar Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Weather Terminal v2.0
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
