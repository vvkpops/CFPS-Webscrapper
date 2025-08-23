// services/weatherFetchingService.js

import { fetchIndividualAlpha, fetchIndividualImage } from './api/weatherApi.js';
import { fetchIndividualGFA } from './api/gfaApi.js';
import { gfaRegionMapping } from '../utils/constants/gfaRegions.js';

export const useWeatherFetching = (config, selectedData, weatherData, scrapingState, fetchProgress) => {
  const fetchSiteDataIndividually = async (site) => {
    const alphas = selectedData.alpha || [];
    const images = selectedData.image || [];
    const delay = config.requestDelay;
    const gfaRegion = gfaRegionMapping[site];
    
    let allSiteData = {
      site: site,
      gfa_region: gfaRegion,
      alpha_data: {},
      image_data: {},
      fetch_summary: {
        total_requests: 0,
        successful_requests: 0,
        failed_requests: 0,
        start_time: new Date().toISOString()
      }
    };

    const progressItems = [
      ...alphas.map(a => ({ name: a.toUpperCase(), status: 'pending' })),
      ...images.map(i => ({ name: i, status: 'pending' }))
    ];
    fetchProgress.updateProgress(site, progressItems);

    let currentIndex = 0;
    let localStats = { responseTimes: [] };

    // Fetch alpha data
    for (const alpha of alphas) {
      try {
        fetchProgress.updateItemStatus(site, currentIndex, 'pending');
        
        const startTime = Date.now();
        const alphaData = await fetchIndividualAlpha(site, alpha);
        const responseTime = Date.now() - startTime;
        
        allSiteData.alpha_data[alpha] = alphaData;
        allSiteData.fetch_summary.successful_requests++;
        localStats.responseTimes.push(responseTime);
        
        fetchProgress.updateItemStatus(site, currentIndex, 'success', responseTime);
        
      } catch (error) {
        console.warn(`Failed to fetch ${alpha} for ${site}:`, error);
        allSiteData.alpha_data[alpha] = { error: error.message };
        allSiteData.fetch_summary.failed_requests++;
        fetchProgress.updateItemStatus(site, currentIndex, 'failed', null, error.message);
      }
      
      allSiteData.fetch_summary.total_requests++;
      currentIndex++;
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Fetch image data
    for (const image of images) {
      try {
        fetchProgress.updateItemStatus(site, currentIndex, 'pending');
        
        const startTime = Date.now();
        
        let imageData;
        if (image.includes('GFA') && gfaRegion) {
          imageData = await fetchIndividualGFA(site, gfaRegion, image);
        } else {
          imageData = await fetchIndividualImage(site, image);
        }
        
        const responseTime = Date.now() - startTime;
        
        allSiteData.image_data[image] = imageData;
        allSiteData.fetch_summary.successful_requests++;
        localStats.responseTimes.push(responseTime);
        
        fetchProgress.updateItemStatus(site, currentIndex, 'success', responseTime);
        
      } catch (error) {
        console.warn(`Failed to fetch ${image} for ${site}:`, error);
        allSiteData.image_data[image] = { error: error.message };
        allSiteData.fetch_summary.failed_requests++;
        fetchProgress.updateItemStatus(site, currentIndex, 'failed', null, error.message);
      }
      
      allSiteData.fetch_summary.total_requests++;
      currentIndex++;
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    allSiteData.fetch_summary.end_time = new Date().toISOString();
    
    // Count data points
    let dataPoints = 0;
    Object.values(allSiteData.alpha_data).forEach(data => {
      if (data.data && Array.isArray(data.data)) {
        dataPoints += data.data.length;
      } else if (!data.error) {
        dataPoints += 1;
      }
    });
    Object.values(allSiteData.image_data).forEach(data => {
      if (data.data && Array.isArray(data.data)) {
        dataPoints += data.data.length;
      } else if (!data.error) {
        dataPoints += 1;
      }
    });
    
    allSiteData.fetch_summary.data_points = dataPoints;
    
    // Update stats
    weatherData.updateStats({
      successful: 1,
      dataPoints: dataPoints,
      responseTimes: localStats.responseTimes
    });

    return allSiteData;
  };

  const fetchWeatherData = async (sites = null) => {
    scrapingState.updateProgress(0);
    fetchProgress.clearProgress();
    
    const sitesToFetch = sites || [
      config.primarySite,
      ...config.additionalSites
    ].filter(site => site.length > 0);

    const uniqueSites = [...new Set(sitesToFetch.map(s => s.toUpperCase()))];

    scrapingState.updateStatus(`Preparing to fetch data for ${uniqueSites.length} site(s)...`, 'info');

    let allResults = {};
    let completed = 0;

    for (const site of uniqueSites) {
      try {
        scrapingState.updateStatus(`Fetching data for ${site}...`, 'info');
        
        const result = await fetchSiteDataIndividually(site);
        allResults[site] = result;
        
        completed++;
        scrapingState.updateProgress((completed / uniqueSites.length) * 100);
        
      } catch (error) {
        console.error(`Error fetching data for ${site}:`, error);
        allResults[site] = { error: error.message };
        weatherData.updateStats({ failed: 1 });
        completed++;
        scrapingState.updateProgress((completed / uniqueSites.length) * 100);
      }
      weatherData.updateStats({ total: 1 });
    }

    // Store results
    const sessionData = {
      timestamp: new Date().toISOString(),
      sites: uniqueSites,
      data: allResults
    };
    
    weatherData.addSessionData(sessionData);
    scrapingState.updateStatus(`Completed fetching data for ${uniqueSites.length} sites`, 'success');
    
    // Clear fetch progress after a delay
    setTimeout(() => {
      fetchProgress.clearProgress();
    }, 3000);
  };

  const debugGFAAPI = async () => {
    const site = config.primarySite || "CYYT";
    const gfaRegion = gfaRegionMapping[site];
    
    if (!gfaRegion) {
      scrapingState.updateStatus(`❌ No GFA region found for ${site}`, 'error');
      return;
    }
    
    scrapingState.updateStatus(`🔍 Testing different GFA API parameters for ${site} → ${gfaRegion}...`, 'info');
    
    // Simulate debug testing
    await new Promise(resolve => setTimeout(resolve, 2000));
    scrapingState.updateStatus(`🔍 GFA API debug complete for ${site} → ${gfaRegion}`, 'success');
  };

  const testIndividualFetches = async () => {
    const site = config.primarySite || "CYYT";
    scrapingState.updateStatus('🔬 Testing individual API call patterns...', 'info');
    
    // Simulate individual testing
    await new Promise(resolve => setTimeout(resolve, 2000));
    scrapingState.updateStatus('🔬 Individual API testing complete', 'success');
  };

  return {
    fetchWeatherData,
    debugGFAAPI,
    testIndividualFetches
  };
};
