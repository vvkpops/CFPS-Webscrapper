// components/configuration/ConfigurationPanel.jsx

import React from 'react';
import { Settings } from 'lucide-react';
import Card from '../common/Card.jsx';
import GFARegionMap from './GFARegionMap.jsx';

const ConfigurationPanel = ({ config, onConfigChange, onGFAMapToggle, showGFAMap }) => {
  const updateConfig = (field, value) => {
    onConfigChange({ ...config, [field]: value });
  };

  return (
    <Card title="Site Configuration" icon={Settings} borderColor="blue-500" className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Primary ICAO Site</label>
          <input
            type="text"
            value={config.primarySite}
            onChange={(e) => updateConfig('primarySite', e.target.value.toUpperCase())}
            placeholder="e.g., CYYT"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Sites</label>
          <input
            type="text"
            value={config.additionalSites.join(',')}
            onChange={(e) => updateConfig('additionalSites', e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0))}
            placeholder="CYUL,CYVR,CYOW"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scrape Interval (sec)</label>
          <input
            type="number"
            value={config.interval}
            onChange={(e) => updateConfig('interval', parseInt(e.target.value))}
            min="60"
            max="3600"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Request Delay (ms)</label>
          <input
            type="number"
            value={config.requestDelay}
            onChange={(e) => updateConfig('requestDelay', parseInt(e.target.value))}
            min="100"
            max="5000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <GFARegionMap 
        config={config}
        showMap={showGFAMap}
        onToggleMap={onGFAMapToggle}
      />
    </Card>
  );
};

export default ConfigurationPanel;
