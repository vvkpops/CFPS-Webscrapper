// components/configuration/GFARegionMap.jsx

import React from 'react';
import { Map } from 'lucide-react';
import Button from '../common/Button.jsx';
import { gfaRegionMapping, regionNames } from '../../utils/constants/gfaRegions.js';

const GFARegionMap = ({ config, showMap, onToggleMap }) => {
  const getGFARegionInfo = () => {
    const sites = [config.primarySite, ...config.additionalSites.filter(s => s.length > 0)];
    const regionInfo = {};
    
    sites.forEach(site => {
      const region = gfaRegionMapping[site.toUpperCase()];
      if (region) {
        if (!regionInfo[region]) regionInfo[region] = [];
        regionInfo[region].push(site.toUpperCase());
      }
    });
    
    return regionInfo;
  };

  const regionInfo = getGFARegionInfo();

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-blue-800">GFA Region Mapping</h3>
        </div>
        <Button
          onClick={onToggleMap}
          size="sm"
          className="text-sm"
        >
          {showMap ? 'Hide' : 'Show'} Region Map
        </Button>
      </div>
      
      {Object.keys(regionInfo).length > 0 ? (
        <div className="space-y-2">
          {Object.entries(regionInfo).map(([region, sites]) => (
            <div key={region} className="text-sm">
              <span className="font-medium text-blue-700">{region}</span>
              <span className="text-gray-600"> ({regionNames[region]}): </span>
              <span className="text-gray-800">{sites.join(', ')}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm italic">Enter ICAO codes to see GFA region mapping</p>
      )}

      {showMap && (
        <div className="mt-4 bg-white p-4 rounded border">
          <h4 className="font-semibold text-gray-800 mb-3">Canadian GFA Regions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Western Regions:</strong><br />
              🟦 GFACN31 - Pacific (BC)<br />
              🟩 GFACN32 - Prairies (AB/SK/MB)<br />
              🟨 GFACN35 - Yukon & NWT
            </div>
            <div>
              <strong>Eastern Regions:</strong><br />
              🟧 GFACN33 - Ontario-Quebec<br />
              🟥 GFACN34 - Atlantic (NB/NS/PE/NL)
            </div>
            <div>
              <strong>Northern Regions:</strong><br />
              🟪 GFACN36 - Nunavut<br />
              ⬜ GFACN37 - Arctic
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GFARegionMap;
