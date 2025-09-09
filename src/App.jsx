// App.jsx - Enhanced Version

import React, { useState } from 'react';

// Enhanced Components
import ConfigurationPanel from './components/configuration/ConfigurationPanel.jsx';
import DataSelectionPanel from './components/dataSelection/DataSelectionPanel.jsx';
import ControlPanel from './components/controls/ControlPanel.jsx';
import ProgressPanel from './components/progress/ProgressPanel.jsx';
import StatisticsPanel from './components/progress/StatisticsPanel.jsx';
import ExportPanel from './components/export/ExportPanel.jsx';
import EnhancedTabbedResults from './components/results/EnhancedTabbedResults.jsx';

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

  const handleRefresh = () => {
    weatherFetching.fetchWeatherData();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-10 rounded-3xl"></div>
          <div className="relative py-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              🌤️ CFPS WxRecall Scraper
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Professional weather data collection and visualization tool for Canadian Flight Planning System
            </p>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Real-time Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Advanced Visualization</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Export Ready</span>
              </div>
            </div>
          </div>
        </div>

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

        {/* Enhanced Results */}
        <EnhancedTabbedResults 
          results={weatherData.results} 
          onRefresh={handleRefresh}
        />

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <div className="border-t border-gray-200 pt-6">
            <p className="mb-2">
              Powered by NAV Canada CFPS WxRecall API • Built with React & Tailwind CSS
            </p>
            <div className="flex items-center justify-center gap-4">
              <span>Real-time weather data</span>
              <span>•</span>
              <span>Professional aviation weather</span>
              <span>•</span>
              <span>Enhanced visualization</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CFPSWxScraper;
