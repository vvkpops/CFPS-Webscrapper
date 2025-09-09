// hooks/useWeatherData.js

import { useState } from 'react';

export const useWeatherData = () => {
  const [allData, setAllData] = useState([]);
  const [results, setResults] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    dataPoints: 0,
    responseTimes: []
  });

  const addSessionData = (sessionData) => {
    setAllData(prev => [...prev, sessionData]);
    setResults(sessionData.data);
  };

  const updateStats = (newStats) => {
    setStats(prev => ({
      ...prev,
      total: prev.total + (newStats.total || 0),
      successful: prev.successful + (newStats.successful || 0),
      failed: prev.failed + (newStats.failed || 0),
      dataPoints: prev.dataPoints + (newStats.dataPoints || 0),
      responseTimes: [...prev.responseTimes, ...(newStats.responseTimes || [])]
    }));
  };

  const clearData = () => {
    setAllData([]);
    setResults({});
    setStats({ total: 0, successful: 0, failed: 0, dataPoints: 0, responseTimes: [] });
  };

  return {
    allData,
    results,
    stats,
    addSessionData,
    updateStats,
    clearData
  };
};
