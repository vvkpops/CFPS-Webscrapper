// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import Sidebar from './components/layout/Sidebar.jsx';
import MainContent from './components/layout/MainContent.jsx';
import { useWeatherData } from './hooks/useWeatherData.js';
import { useScrapingState } from './hooks/useScrapingState.js';
import { useFetchProgress } from './hooks/useFetchProgress.js';
import { useWeatherFetching } from './services/weatherFetchingService.js';
import { useExportData } from './services/export/exportService.js';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const [lastUpdate, setLastUpdate] = useState(null);

  const weatherData = useWeatherData();
  const scrapingState = useScrapingState();
  const fetchProgress = useFetchProgress();
  const exportData = useExportData();
  const weatherFetching = useWeatherFetching(
    config, 
    selectedData, 
    weatherData, 
    scrapingState, 
    fetchProgress
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Add global keyboard shortcut for fetching
  useEffect(() => {
    const handleGlobalKeyPress = (e) => {
      // Ctrl+Enter or Cmd+Enter to fetch from anywhere
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !scrapingState.isScrapingActive) {
        handleFetch();
      }
      // F5 to refresh (prevent default browser refresh)
      if (e.key === 'F5') {
        e.preventDefault();
        if (!scrapingState.isScrapingActive) {
          handleFetch();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyPress);
    return () => window.removeEventListener('keydown', handleGlobalKeyPress);
  }, [scrapingState.isScrapingActive]);

  const handleFetch = async () => {
    await weatherFetching.fetchWeatherData();
    setLastUpdate(new Date());
  };

  const handleStartContinuous = () => {
    scrapingState.startContinuous(
      () => {
        weatherFetching.fetchWeatherData();
        setLastUpdate(new Date());
      },
      config.interval
    );
  };

  const handleClear = () => {
    weatherData.clearData();
    fetchProgress.clearProgress();
    scrapingState.updateStatus('Data cleared', 'info');
  };

  const handleExport = (format) => {
    if (weatherData.allData.length === 0) {
      scrapingState.updateStatus('No data to export', 'warning');
      return;
    }
    
    switch(format) {
      case 'json':
        exportData.exportJSON(weatherData.allData);
        break;
      case 'csv':
        exportData.exportCSV(weatherData.allData);
        break;
      case 'html':
        exportData.exportHTML(weatherData.allData, weatherData.stats, weatherData.results, config);
        break;
    }
    scrapingState.updateStatus(`Data exported as ${format.toUpperCase()}`, 'success');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar with fetch button and enter key support */}
      <Sidebar
        config={config}
        setConfig={setConfig}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onFetch={handleFetch}
        isLoading={scrapingState.isScrapingActive}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Weather Terminal
            </h1>
            {lastUpdate && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500">
              <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl</kbd> + 
              <kbd className="px-2 py-1 bg-gray-100 rounded ml-1">Enter</kbd> to fetch
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <MainContent
          weatherData={weatherData}
          scrapingState={scrapingState}
          fetchProgress={fetchProgress}
          onFetch={handleFetch}
          onStartContinuous={handleStartContinuous}
          onStopContinuous={scrapingState.stopContinuous}
          onClear={handleClear}
          onExport={handleExport}
          config={config}
        />
      </div>
    </div>
  );
};

export default App;
