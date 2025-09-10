// src/components/viewer/DataViewer.jsx
import React, { useState } from 'react';
import UnifiedView from './UnifiedView.jsx';
import GridView from './GridView.jsx';
import ListView from './ListView.jsx';

const DataViewer = ({ weatherData, viewMode, fetchProgress }) => {
  const [selectedSite, setSelectedSite] = useState(Object.keys(weatherData)[0] || '');

  const renderView = () => {
    switch(viewMode) {
      case 'grid':
        return <GridView weatherData={weatherData} />;
      case 'list':
        return <ListView weatherData={weatherData} />;
      default:
        return (
          <UnifiedView 
            weatherData={weatherData} 
            selectedSite={selectedSite}
            setSelectedSite={setSelectedSite}
            fetchProgress={fetchProgress}
          />
        );
    }
  };

  return (
    <div className="h-full overflow-hidden">
      {renderView()}
    </div>
  );
};

export default DataViewer;