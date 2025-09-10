// components/results/TabbedResults.jsx

import React, { useState, useEffect } from 'react';
import Card from '../common/Card.jsx';
import Tabs from '../common/Tabs.jsx';
import ResultsOverview from './ResultsOverview.jsx';
import AlphanumericResults from './AlphanumericResults.jsx';
import ImageResults from './ImageResults.jsx';

const { Panel: TabPanel } = Tabs;

const TabbedResults = ({ results }) => {
  const [activeSite, setActiveSite] = useState('');

  useEffect(() => {
    if (results && Object.keys(results).length > 0 && !activeSite) {
      setActiveSite(Object.keys(results)[0]);
    }
  }, [results, activeSite]);

  if (!results || Object.keys(results).length === 0) {
    return (
      <Card borderColor="gray-500">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Weather Data Results</h2>
        <p className="text-gray-500">No data available. Run a fetch to see results here.</p>
      </Card>
    );
  }

  const sites = Object.keys(results);
  const currentSiteData = results[activeSite];

  return (
    <Card borderColor="gray-500">
      {/* Site Selection */}
      <div className="border-b pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Weather Data Results</h2>
        <div className="flex flex-wrap gap-2">
          {sites.map(site => (
            <button
              key={site}
              onClick={() => setActiveSite(site)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSite === site
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🛩️ {site}
            </button>
          ))}
        </div>
      </div>

      {/* Data Tabs */}
      <Tabs defaultTab="overview">
        <TabPanel 
          key="overview" 
          value="overview" 
          label="📊 Overview"
          activeColor="bg-blue-600 text-white border-b-2 border-blue-600"
        >
          <ResultsOverview siteData={currentSiteData} />
        </TabPanel>
        
        <TabPanel 
          key="alpha" 
          value="alpha" 
          label="📋 Alphanumeric Data"
          activeColor="bg-green-600 text-white border-b-2 border-green-600"
        >
          <AlphanumericResults 
            alphaData={currentSiteData?.alpha_data} 
            activeSite={activeSite} 
          />
        </TabPanel>
        
        <TabPanel 
          key="images" 
          value="images" 
          label="🗺️ Weather Imagery"
          activeColor="bg-purple-600 text-white border-b-2 border-purple-600"
        >
          <ImageResults imageData={currentSiteData?.image_data} />
        </TabPanel>
      </Tabs>
    </Card>
  );
};

export default TabbedResults;
