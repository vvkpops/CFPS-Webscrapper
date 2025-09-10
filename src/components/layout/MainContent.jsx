// src/components/layout/MainContent.jsx

import React from 'react';
import UnifiedWeatherViewer from '../results/UnifiedWeatherViewer.jsx';

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
  return (
    <main className="flex-1 overflow-auto p-6">
      <UnifiedWeatherViewer
        weatherData={weatherData.results}
        isLoading={scrapingState.isScrapingActive}
        onRefresh={onFetch}
        status={scrapingState.status}
        config={config}
        onExport={onExport}
        fetchProgress={fetchProgress.fetchProgress}
        stats={weatherData.stats}
        onStartContinuous={onStartContinuous}
        onStopContinuous={onStopContinuous}
        onClear={onClear}
        isScrapingActive={scrapingState.isScrapingActive}
      />
    </main>
  );
};

export default MainContent;
