// App.jsx - Simplified Version

import React, { useState, useEffect } from 'react';

// Components
import SimplifiedConfigurationPanel from './components/configuration/SimplifiedConfigurationPanel.jsx';
import ProfessionalWeatherTerminal from './components/results/ProfessionalWeatherTerminal.jsx';

// Hooks
import { useWeatherData } from './hooks/useWeatherData.js';
import { useScrapingState } from './hooks/useScrapingState.js';
import { useFetchProgress } from './hooks/useFetchProgress.js';

// Services
import { useWeatherFetching } from './services/weatherFetchingService.js';

const CFPSWxScraper = () => {
  const [config, setConfig] = useState({
    primarySite: 'CYYT',
    additionalSites: ['CYUL', 'CYVR'],
    interval: 300,
    requestDelay: 500
  });

  // Auto-select all data types by default
  const [selectedData, setSelectedData] = useState({
    alpha: ['metar', 'taf', 'notam', 'sigmet', 'airmet', 'pirep', 'upperwind', 'space_weather', 'vfr_route', 'area_forecast'],
    image: ['SATELLITE/IR', 'SATELLITE/VIS', 'SATELLITE/WV', 'RADAR/COMPOSITE', 'RADAR/CAPPI_RAIN', 'GFA/CLDWX', 'GFA/TURBC', 'GFA/WINDS', 'SIG_WX/HIGH_LEVEL']
  });

  const [isSelectionExpanded, setIsSelectionExpanded] = useState(false);

  // Custom hooks
  const weatherData = useWeatherData();
  const scrapingState = useScrapingState();
  const fetchProgress = useFetchProgress();

  // Weather fetching service
  const weatherFetching = useWeatherFetching(
    config, 
    selectedData, 
    weatherData, 
    scrapingState, 
    fetchProgress
  );

  // Auto-fetch on component mount
  useEffect(() => {
    if (config.primarySite) {
      weatherFetching.fetchWeatherData();
    }
  }, []); // Only run once on mount

  const handleFetch = () => {
    weatherFetching.fetchWeatherData();
  };

  const handleRefresh = () => {
    weatherFetching.fetchWeatherData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Simplified Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌤️ CFPS WxRecall Terminal
          </h1>
          <p className="text-gray-600">Professional Weather Data Interface</p>
        </div>

        {/* Collapsible Configuration */}
        <SimplifiedConfigurationPanel 
          config={config}
          setConfig={setConfig}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          isExpanded={isSelectionExpanded}
          setExpanded={setIsSelectionExpanded}
          onFetch={handleFetch}
          isLoading={scrapingState.progress > 0 && scrapingState.progress < 100}
          lastUpdate={weatherData.allData.length > 0 ? new Date(weatherData.allData[weatherData.allData.length - 1]?.timestamp) : null}
        />

        {/* Professional Weather Interface */}
        <ProfessionalWeatherTerminal 
          weatherData={weatherData.results}
          isLoading={scrapingState.progress > 0 && scrapingState.progress < 100}
          onRefresh={handleRefresh}
          status={scrapingState.status}
        />
      </div>
    </div>
  );
};

export default CFPSWxScraper;
