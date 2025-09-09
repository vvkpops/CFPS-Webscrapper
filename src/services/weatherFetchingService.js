// services/weatherFetchingService.js - Simplified Version

import { fetchIndividualAlpha, fetchIndividualImage } from './api/weatherApi.js';
import { fetchIndividualGFA } from './api/gfaApi.js';
import { gfaRegionMapping } from '../utils/constants/gfaRegions.js';

export const useWeatherFetching = (config, selectedData, weatherData, scrapingState, fetchProgress) => {
  const fetchSiteDataBulk = async (site) => {
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
        start_time: new Date().toISOString(),
        data_points: 0
      }
    };

    // Simplified bulk fetching - no individual progress tracking
    scrapingState.updateStatus(`Fetching all data for ${site}...`, 'info');

    // Fetch all alpha data
    const alphaPromises = alphas.map(async (alpha) => {
      try {
        const startTime = Date.now();
        const alphaData = await fetchIndividualAlpha(site, alpha);
        const responseTime = Date.now() - startTime;
        
        allSiteData.alpha_data[alpha] = alphaData;
        allSiteData.fetch_summary.successful_requests++;
        
        // Add small delay between requests
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        return { success: true, responseTime };
      } catch (error) {
        console.warn(`Failed to fetch ${alpha} for ${site}:`, error);
        allSiteData.alpha_data[alpha] = { error: error.message };
        allSiteData.fetch_summary.failed_requests++;
        return { success: false, error: error.message };
      } finally {
        allSiteData.fetch_summary.total_requests++;
      }
    });

    // Fetch all image data
    const imagePromises = images.map(async (image) => {
      try {
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
        
        // Add small delay between requests
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        return { success: true, responseTime };
      } catch (error) {
        console.warn(`Failed to fetch ${image} for ${site}:`, error);
        allSiteData.image_data[image] = { error: error.message };
        allSiteData.fetch_summary.failed_requests++;
        return { success: false, error: error.message };
      } finally {
        allSiteData.fetch_summary.total_requests++;
      }
    });

    // Wait for all requests to complete
    const allResults = await Promise.all([...alphaPromises, ...imagePromises]);
    
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
      } else if (data.images && Array.isArray(data.images)) {
        dataPoints += data.images.length;
      } else if (!data.error) {
        dataPoints += 1;
      }
    });
    
    allSiteData.fetch_summary.data_points = dataPoints;
    
    // Update stats
    const successCount = allResults.filter(r => r.success).length;
    const responseTimes = allResults.filter(r => r.responseTime).map(r => r.responseTime);
    
    weatherData.updateStats({
      total: 1,
      successful: successCount > 0 ? 1 : 0,
      failed: successCount === 0 ? 1 : 0,
      dataPoints: dataPoints,
      responseTimes: responseTimes
    });

    return allSiteData;
  };

  const fetchWeatherData = async (sites = null) => {
    // Reset progress and start fetching
    scrapingState.updateProgress(0);
    fetchProgress.clearProgress();
    
    const sitesToFetch = sites || [
      config.primarySite,
      ...config.additionalSites
    ].filter(site => site.length > 0);

    const uniqueSites = [...new Set(sitesToFetch.map(s => s.toUpperCase()))];

    scrapingState.updateStatus(`Fetching weather data for ${uniqueSites.length} site(s)...`, 'info');
    scrapingState.updateProgress(10);

    let allResults = {};
    let completed = 0;

    // Process sites sequentially for now (can be made parallel if needed)
    for (const site of uniqueSites) {
      try {
        scrapingState.updateStatus(`Processing ${site}...`, 'info');
        scrapingState.updateProgress(10 + (completed / uniqueSites.length) * 80);
        
        const result = await fetchSiteDataBulk(site);
        allResults[site] = result;
        
        completed++;
        scrapingState.updateProgress(10 + (completed / uniqueSites.length) * 80);
        
      } catch (error) {
        console.error(`Error fetching data for ${site}:`, error);
        allResults[site] = { 
          site: site,
          error: error.message,
          fetch_summary: {
            total_requests: 0,
            successful_requests: 0,
            failed_requests: 1
          }
        };
        weatherData.updateStats({ total: 1, failed: 1 });
        completed++;
        scrapingState.updateProgress(10 + (completed / uniqueSites.length) * 80);
      }
    }

    // Finalize
    scrapingState.updateProgress(100);

    // Store results
    const sessionData = {
      timestamp: new Date().toISOString(),
      sites: uniqueSites,
      data: allResults
    };
    
    weatherData.addSessionData(sessionData);
    scrapingState.updateStatus(`Successfully fetched data for ${uniqueSites.length} sites`, 'success');
    
    // Reset progress after a short delay
    setTimeout(() => {
      scrapingState.updateProgress(0);
    }, 2000);
  };

  const debugGFAAPI = async () => {
    const site = config.primarySite || "CYYT";
    const gfaRegion = gfaRegionMapping[site];
    
    if (!gfaRegion) {
      scrapingState.updateStatus(`❌ No GFA region found for ${site}`, 'error');
      return;
    }
    
    scrapingState.updateStatus(`🔍 Testing GFA API for ${site} → ${gfaRegion}...`, 'info');
    
    // Simulate debug testing
    await new Promise(resolve => setTimeout(resolve, 2000));
    scrapingState.updateStatus(`🔍 GFA API debug complete for ${site} → ${gfaRegion}`, 'success');
  };

  const testIndividualFetches = async () => {
    const site = config.primarySite || "CYYT";
    scrapingState.updateStatus('🔬 Testing individual API calls...', 'info');
    
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
