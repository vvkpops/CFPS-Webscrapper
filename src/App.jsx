// App.jsx

import React, { useState } from 'react';

// Components
import ConfigurationPanel from './components/configuration/ConfigurationPanel.jsx';
import DataSelectionPanel from './components/dataSelection/DataSelectionPanel.jsx';
import ControlPanel from './components/controls/ControlPanel.jsx';
import ProgressPanel from './components/progress/ProgressPanel.jsx';
import StatisticsPanel from './components/progress/StatisticsPanel.jsx';
import ExportPanel from './components/export/ExportPanel.jsx';
import TabbedResults from './components/results/TabbedResults.jsx';
// import APIDebugPanel from './components/debug/APIDebugPanel.jsx'; // removed from main UI

// Hooks
import { useWeatherData } from './hooks/useWeatherData.js';
import { useScrapingState } from './hooks/useScrapingState.js';
import { useFetchProgress } from './hooks/useFetchProgress.js';

// Services
import { useWeatherFetching } from './services/weatherFetchingService.js';
import { useExportData } from './services/export/exportService.js';

const CFPSWxScraper = () => {
  const [config, setConfig] = useState({
    primarySite: 'CYYT',
    additionalSites: [],
    interval: 300,
    requestDelay: 500
  });

  const [selectedData, setSelectedData] = useState({
    alpha: ['metar', 'taf'],
    image: ['GFA/CLDWX', 'GFA/TURBC']
  });

  const [showGFAMap, setShowGFAMap] = useState(false);
  // Debug panel removed from main screen
  // const [showDebugPanel, setShowDebugPanel] = useState(true);

  // Custom hooks
  const weatherData = useWeatherData();
  const scrapingState = useScrapingState();
  const fetchProgress = useFetchProgress();
  const exportData = useExportData();

  // Weather fetching service
  const weatherFetching = useWeatherFetching(
    config, 
    selectedData, 
    weatherData, 
    scrapingState, 
    fetchProgress
  );

  const handleStartContinuous = () => {
    scrapingState.startContinuous(
      () => weatherFetching.fetchWeatherData(),
      config.interval
    );
  };

  const handleClear = () => {
    weatherData.clearData();
    fetchProgress.clearProgress();
    scrapingState.updateStatus('Results cleared', 'info');
  };

  const handleExportJSON = () => {
    if (weatherData.allData.length === 0) {
      scrapingState.updateStatus('No data to export', 'warning');
      return;
    }
    exportData.exportJSON(weatherData.allData);
    scrapingState.updateStatus('Data exported as JSON', 'success');
  };

  const handleExportCSV = () => {
    if (weatherData.allData.length === 0) {
      scrapingState.updateStatus('No data to export', 'warning');
      return;
    }
    exportData.exportCSV(weatherData.allData);
    scrapingState.updateStatus('Data exported as CSV', 'success');
  };

  const handleExportHTML = () => {
    if (weatherData.allData.length === 0) {
      scrapingState.updateStatus('No data to export', 'warning');
      return;
    }
    exportData.exportHTML(weatherData.allData, weatherData.stats, weatherData.results, config);
    scrapingState.updateStatus('Data exported as HTML', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌤️ Complete CFPS WxRecall Scraper
          </h1>
          <p className="text-lg text-gray-600">
            Advanced weather data collection tool for Canadian Flight Planning System
          </p>
        </div>

        {/* Debug Panel intentionally hidden from main UI */}

        {/* Configuration */}
        <ConfigurationPanel 
          config={config}
          onConfigChange={setConfig}
          onGFAMapToggle={() => setShowGFAMap(!showGFAMap)}
          showGFAMap={showGFAMap}
        />

        {/* Data Selection */}
        <DataSelectionPanel 
          selectedData={selectedData}
          onDataChange={setSelectedData}
        />

        {/* Controls */}
        <ControlPanel 
          isScrapingActive={scrapingState.isScrapingActive}
          onFetch={() => weatherFetching.fetchWeatherData()}
          onStartContinuous={handleStartContinuous}
          onStopContinuous={scrapingState.stopContinuous}
          onClear={handleClear}
          // debug removed from main controls
          onTest={weatherFetching.testIndividualFetches}
        />

        {/* Progress */}
        <ProgressPanel 
          progress={scrapingState.progress}
          status={scrapingState.status}
          isVisible={scrapingState.progress > 0 || Object.keys(fetchProgress.fetchProgress).length > 0}
          fetchProgress={fetchProgress.fetchProgress}
        />

        {/* Statistics */}
        <StatisticsPanel 
          stats={weatherData.stats}
          isVisible={weatherData.stats.total > 0}
        />

        {/* Export */}
        <ExportPanel 
          onExportJSON={handleExportJSON}
          onExportCSV={handleExportCSV}
          onExportHTML={handleExportHTML}
          hasData={weatherData.allData.length > 0}
        />

        {/* Results */}
        <TabbedResults results={weatherData.results} />
      </div>
    </div>
  );
};

export default CFPSWxScraper;
