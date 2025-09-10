// src/components/strip/WeatherStrip.jsx
import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

// Components
import Header from './Header.jsx';
import GfaDisplay from './GfaDisplay.jsx';
import NotamDisplay from './NotamDisplay.jsx';
import MetarTafDisplay from './MetarTafDisplay.jsx';
import RadarDisplay from './RadarDisplay.jsx';

// Hooks
import { useWeatherData } from '../../hooks/useWeatherData.js';
import { useScrapingState } from '../../hooks/useScrapingState.js';
import { useFetchProgress } from '../../hooks/useFetchProgress.js';

// Services
import { useWeatherFetching } from '../../services/weatherFetchingService.js';

const WeatherStrip = () => {
  const [config, setConfig] = useState({
    primarySite: 'CYQX',
    additionalSites: [],
    interval: 300,
    requestDelay: 200,
  });

  const [selectedData] = useState({
    alpha: ['metar', 'taf', 'notam'],
    image: ['GFA/CLDWX', 'GFA/TURBC', 'RADAR/COMPOSITE'],
  });

  // Custom hooks
  const weatherData = useWeatherData();
  const scrapingState = useScrapingState();
  const fetchProgress = useFetchProgress();
  
  const weatherFetching = useWeatherFetching(config, selectedData, weatherData, scrapingState, fetchProgress);
  
  const handleSearch = (site) => {
    const newConfig = { ...config, primarySite: site };
    setConfig(newConfig);
    weatherData.clearData();
    weatherFetching.fetchWeatherData([site]);
  };

  useEffect(() => {
    // Initial fetch on component mount
    weatherFetching.fetchWeatherData([config.primarySite]);
  }, []); // an empty dependency array to run only once on mount

  const currentSiteData = weatherData.results[config.primarySite];
  const isLoading = scrapingState.progress < 100 && scrapingState.progress > 0;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header onSearch={handleSearch} initialSite={config.primarySite} />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader className="w-12 h-12 animate-spin text-blue-600" />
            <p className="ml-4 text-lg text-gray-700">Fetching weather data for {config.primarySite}...</p>
          </div>
        )}

        {!isLoading && !currentSiteData && (
           <div className="text-center py-20">
             <h2 className="text-2xl font-bold text-gray-800">No Data Available</h2>
             <p className="text-gray-600 mt-2">Could not fetch data for {config.primarySite}. Please try another airport.</p>
           </div>
        )}

        {currentSiteData && (
          <div className="bg-white p-6 rounded-lg shadow-soft divide-y divide-gray-200">
            <div className="flex justify-between items-center pb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{config.primarySite}</h1>
                <p className="text-gray-500">{/* Full airport name could go here */}</p>
              </div>
              <div className="text-right text-xs text-gray-500">
                <p>Data time: {new Date().toISOString().replace('T', ' ').substring(0, 19)}Z</p>
                <p>Current time: {new Date().toISOString().replace('T', ' ').substring(0, 19)}Z</p>
              </div>
            </div>

            <GfaDisplay imageData={currentSiteData.image_data} />
            <NotamDisplay data={currentSiteData.alpha_data?.notam} />
            <MetarTafDisplay data={currentSiteData.alpha_data?.metar} title="METAR" />
            <MetarTafDisplay data={currentSiteData.alpha_data?.taf} title="TAF" />
            <RadarDisplay imageData={currentSiteData.image_data} />
          </div>
        )}
      </main>
    </div>
  );
};

export default WeatherStrip;