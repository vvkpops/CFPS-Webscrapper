// hooks/useScrapingState.js

import { useState, useEffect } from 'react';

export const useScrapingState = () => {
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [scrapingInterval, setScrapingInterval] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState({ message: 'Ready to scrape weather data', type: 'info' });

  const updateStatus = (message, type = 'info') => {
    setStatus({ message, type });
  };

  const updateProgress = (percent) => {
    setProgress(percent);
  };

  const startContinuous = (callback, interval) => {
    setIsScrapingActive(true);
    updateStatus(`Starting continuous scraping every ${interval} seconds...`, 'info');
    
    callback(); // Initial fetch
    
    const intervalId = setInterval(callback, interval * 1000);
    setScrapingInterval(intervalId);
    updateStatus(`Continuous scraping active (every ${interval}s)`, 'success');
  };

  const stopContinuous = () => {
    if (scrapingInterval) {
      clearInterval(scrapingInterval);
      setScrapingInterval(null);
    }
    setIsScrapingActive(false);
    updateStatus('Continuous scraping stopped', 'info');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrapingInterval) {
        clearInterval(scrapingInterval);
      }
    };
  }, [scrapingInterval]);

  return {
    isScrapingActive,
    progress,
    status,
    updateStatus,
    updateProgress,
    startContinuous,
    stopContinuous
  };
};
