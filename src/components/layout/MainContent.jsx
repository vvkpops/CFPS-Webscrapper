// src/components/layout/MainContent.jsx
import React, { useState } from 'react';
import ControlBar from '../controls/ControlBar.jsx';
import DataViewer from '../viewer/DataViewer.jsx';
import StatusBar from '../status/StatusBar.jsx';
import EmptyState from '../common/EmptyState.jsx';

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
  const [viewMode, setViewMode] = useState('unified');

  const hasData = weatherData.results && Object.keys(weatherData.results).length > 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Control Bar */}
      <ControlBar
        isLoading={scrapingState.progress > 0 && scrapingState.progress < 100}
        isScrapingActive={scrapingState.isScrapingActive}
        onFetch={onFetch}
        onStartContinuous={onStartContinuous}
        onStopContinuous={onStopContinuous}
        onClear={onClear}
        onExport={onExport}
        hasData={hasData}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {hasData ? (
          <DataViewer
            weatherData={weatherData.results}
            viewMode={viewMode}
            fetchProgress={fetchProgress.fetchProgress}
          />
        ) : (
          <EmptyState
            isLoading={scrapingState.progress > 0}
            progress={scrapingState.progress}
            message={scrapingState.status.message}
          />
        )}
      </div>

      {/* Status Bar */}
      <StatusBar
        stats={weatherData.stats}
        status={scrapingState.status}
        isVisible={hasData || scrapingState.progress > 0}
      />
    </div>
  );
};

export default MainContent;