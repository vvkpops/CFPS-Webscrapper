// src/components/layout/MainContent.jsx

import React from 'react';
import ProfessionalWeatherTerminal from '../results/ProfessionalWeatherTerminal.jsx';

const MainContent = ({
  weatherData,
  scrapingState,
  fetchProgress,
  onFetch,
  onStartContinuous,
  onStopContinuous,
  onClear,
  onExport,
  config
}) => {
  // Use the ProfessionalWeatherTerminal which has proper imagery support
  return (
    <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
      <ProfessionalWeatherTerminal
        weatherData={weatherData.results}
        isLoading={scrapingState.isScrapingActive}
        onRefresh={onFetch}
        status={scrapingState.status}
      />
      
      {/* Export controls */}
      {weatherData.results && Object.keys(weatherData.results).length > 0 && (
        <div className="mt-6 flex gap-2 justify-end">
          <button
            onClick={() => onExport('json')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export JSON
          </button>
          <button
            onClick={() => onExport('csv')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Export CSV
          </button>
          <button
            onClick={() => onExport('html')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Export HTML
          </button>
        </div>
      )}
    </main>
  );
};

export default MainContent;
