// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Settings, Database, Map, 
  FileText, Image, Star, CheckSquare, Square 
} from 'lucide-react';
import { alphaOptions, imageCategories } from '../../utils/constants/dataTypes.js';
import { gfaRegionMapping, regionNames } from '../../utils/constants/gfaRegions.js';

const Sidebar = ({ config, setConfig, selectedData, setSelectedData, collapsed, setCollapsed }) => {
  const [activeSection, setActiveSection] = useState('sites');

  const handleSiteChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const toggleDataSelection = (category, value) => {
    setSelectedData(prev => {
      const current = prev[category] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const selectPreset = (preset) => {
    switch(preset) {
      case 'essential':
        setSelectedData({
          alpha: alphaOptions.filter(opt => opt.essential).map(opt => opt.value),
          image: Object.values(imageCategories).flat().filter(opt => opt.essential).map(opt => opt.value)
        });
        break;
      case 'all':
        setSelectedData({
          alpha: alphaOptions.map(opt => opt.value),
          image: Object.values(imageCategories).flat().map(opt => opt.value)
        });
        break;
      case 'none':
        setSelectedData({ alpha: [], image: [] });
        break;
    }
  };

  const getActiveRegions = () => {
    const sites = [config.primarySite, ...config.additionalSites].filter(s => s);
    const regions = new Set(sites.map(site => gfaRegionMapping[site.toUpperCase()]).filter(Boolean));
    return Array.from(regions);
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-80'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configuration</h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveSection('sites')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeSection === 'sites'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-1" />
              Sites
            </button>
            <button
              onClick={() => setActiveSection('data')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeSection === 'data'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Database className="w-4 h-4 inline mr-1" />
              Data
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeSection === 'sites' ? (
              <div className="space-y-4">
                {/* Primary Site */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Primary Site
                  </label>
                  <input
                    type="text"
                    value={config.primarySite}
                    onChange={(e) => handleSiteChange('primarySite', e.target.value.toUpperCase())}
                    placeholder="CYYT"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Additional Sites */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Sites
                  </label>
                  <input
                    type="text"
                    value={config.additionalSites.join(', ')}
                    onChange={(e) => handleSiteChange('additionalSites', 
                      e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(s => s)
                    )}
                    placeholder="CYUL, CYVR, CYYZ"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Active Regions */}
                {getActiveRegions().length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Map className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        GFA Regions
                      </span>
                    </div>
                    <div className="space-y-1">
                      {getActiveRegions().map(region => (
                        <div key={region} className="text-xs text-blue-700 dark:text-blue-300">
                          {region} - {regionNames[region]}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timing Settings */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Update Interval (seconds)
                    </label>
                    <input
                      type="number"
                      value={config.interval}
                      onChange={(e) => handleSiteChange('interval', parseInt(e.target.value))}
                      min="60"
                      max="3600"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Request Delay (ms)
                    </label>
                    <input
                      type="number"
                      value={config.requestDelay}
                      onChange={(e) => handleSiteChange('requestDelay', parseInt(e.target.value))}
                      min="100"
                      max="5000"
                      step="100"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Quick Presets */}
                <div className="flex gap-2">
                  <button
                    onClick={() => selectPreset('essential')}
                    className="flex-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-xs font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                  >
                    <Star className="w-3 h-3 inline mr-1" />
                    Essential
                  </button>
                  <button
                    onClick={() => selectPreset('all')}
                    className="flex-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <CheckSquare className="w-3 h-3 inline mr-1" />
                    All
                  </button>
                  <button
                    onClick={() => selectPreset('none')}
                    className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Square className="w-3 h-3 inline mr-1" />
                    None
                  </button>
                </div>

                {/* Text Data */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Text Reports ({selectedData.alpha.length})
                  </h3>
                  <div className="space-y-1">
                    {alphaOptions.map(option => (
                      <label key={option.value} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedData.alpha.includes(option.value)}
                          onChange={() => toggleDataSelection('alpha', option.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                          {option.label}
                        </span>
                        {option.essential && (
                          <Star className="w-3 h-3 text-yellow-500" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Image Data */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Weather Imagery ({selectedData.image.length})
                  </h3>
                  {Object.entries(imageCategories).map(([category, options]) => (
                    <div key={category} className="mb-3">
                      <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                        {category}
                      </h4>
                      <div className="space-y-1">
                        {options.map(option => (
                          <label key={option.value} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedData.image.includes(option.value)}
                              onChange={() => toggleDataSelection('image', option.value)}
                              className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                              {option.label}
                            </span>
                            {option.essential && (
                              <Star className="w-3 h-3 text-yellow-500" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;