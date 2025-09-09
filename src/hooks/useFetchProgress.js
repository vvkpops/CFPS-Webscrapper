// hooks/useFetchProgress.js

import { useState } from 'react';

export const useFetchProgress = () => {
  const [fetchProgress, setFetchProgress] = useState({});
  
  const updateProgress = (site, items) => {
    setFetchProgress(prev => ({ ...prev, [site]: items }));
  };

  const clearProgress = () => {
    setFetchProgress({});
  };

  const updateItemStatus = (site, itemIndex, status, responseTime = null, error = null) => {
    setFetchProgress(prev => {
      const siteProgress = prev[site] || [];
      const updatedProgress = [...siteProgress];
      if (updatedProgress[itemIndex]) {
        updatedProgress[itemIndex] = {
          ...updatedProgress[itemIndex],
          status,
          responseTime,
          error
        };
      }
      return { ...prev, [site]: updatedProgress };
    });
  };

  return {
    fetchProgress,
    updateProgress,
    clearProgress,
    updateItemStatus
  };
};
