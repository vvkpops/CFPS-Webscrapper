// src/services/weatherFetchingService.js

import { fetchIndividualAlpha, fetchIndividualImage } from './api/weatherApi.js';
import { fetchIndividualGFA } from './api/gfaApi.js';
import { gfaRegionMapping } from '../utils/constants/gfaRegions.js';

export const useWeatherFetching = (config, selectedData, weatherData, scrapingState, fetchProgress) => {
  const fetchSiteDataIndividually = async (site) => {
    const alphas = selectedData.alpha || [];
    const images = selectedData.image || [];
    const delay = config.requestDelay;
    const gfaRegion = gfaRegionMapping[site];
    
    console.log(`📍 Fetching data for ${site} (GFA Region: ${gfaRegion})`);
    console.log(`📋 Selected Images:`, images);
    
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

    // Fetch image data with enhanced handling
    for (const image of images) {
      try {
        fetchProgress.updateItemStatus(site, currentIndex, 'pending');
        
        const startTime = Date.now();
        let imageData;
        
        // Special handling for GFA images
        if (image.includes('GFA')) {
          if (gfaRegion) {
            console.log(`🗺️ Fetching GFA image: ${image} for region ${gfaRegion}`);
            imageData = await fetchIndividualGFA(site, gfaRegion, image);
          } else {
            console.warn(`⚠️ No GFA region for ${site}, attempting standard fetch`);
            imageData = await fetchIndividualImage(site, image);
          }
        } 
        // Special handling for SATELLITE images
        else if (image.includes('SATELLITE')) {
          console.log(`🛰️ Fetching satellite image: ${image}`);
          imageData = await fetchSatelliteImage(site, image);
        }
        // Special handling for RADAR images
        else if (image.includes('RADAR')) {
          console.log(`📡 Fetching radar image: ${image}`);
          imageData = await fetchRadarImage(site, image);
        }
        // Standard image fetch
        else {
          console.log(`🖼️ Fetching standard image: ${image}`);
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
      if (data.images && Array.isArray(data.images)) {
        dataPoints += data.images.length;
      } else if (data.data && Array.isArray(data.data)) {
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

  // Helper function for satellite images
  const fetchSatelliteImage = async (site, imageType) => {
    try {
      // Try standard API first
      const data = await fetchIndividualImage(site, imageType);
      if (data && !data.error) return data;
    } catch (error) {
      console.warn(`Standard satellite fetch failed, trying direct URLs`);
    }

    // Try direct satellite URLs
    const satelliteProduct = imageType.split('/')[1]?.toLowerCase() || 'ir';
    const directImageData = {
      type: 'direct_satellite_images',
      site: site,
      product: satelliteProduct,
      images: []
    };

    const satelliteUrls = [
      `https://plan.navcanada.ca/weather/images/satellite/${site.toLowerCase()}_${satelliteProduct}.jpg`,
      `https://plan.navcanada.ca/weather/satellite/${satelliteProduct}/${site.toLowerCase()}.jpg`
    ];

    for (const url of satelliteUrls) {
      try {
        const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(url);
        const response = await fetch(proxyUrl, { method: 'HEAD' });
        if (response.ok) {
          directImageData.images.push({
            url: url,
            proxy_url: proxyUrl,
            content_type: response.headers.get('content-type')
          });
          break;
        }
      } catch (error) {
        continue;
      }
    }

    return directImageData.images.length > 0 ? directImageData : { error: 'No satellite images found' };
  };

  // Helper function for radar images
  const fetchRadarImage = async (site, imageType) => {
    try {
      // Try standard API first
      const data = await fetchIndividualImage(site, imageType);
      if (data && !data.error) return data;
    } catch (error) {
      console.warn(`Standard radar fetch failed, trying direct URLs`);
    }

    // Try direct radar URLs
    const radarProduct = imageType.split('/')[1]?.toLowerCase() || 'composite';
    const directImageData = {
      type: 'direct_radar_images',
      site: site,
      product: radarProduct,
      images: []
    };

    const radarUrls = [
      `https://plan.navcanada.ca/weather/images/radar/${site.toLowerCase()}_${radarProduct}.gif`,
      `https://plan.navcanada.ca/weather/radar/${radarProduct}/${site.toLowerCase()}.gif`
    ];

    for (const url of radarUrls) {
      try {
        const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(url);
        const response = await fetch(proxyUrl, { method: 'HEAD' });
        if (response.ok) {
          directImageData.images.push({
            url: url,
            proxy_url: proxyUrl,
            content_type: response.headers.get('content-type')
          });
          break;
        }
      } catch (error) {
        continue;
      }
    }

    return directImageData.images.length > 0 ? directImageData : { error: 'No radar images found' };
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
    
    // Test fetching GFA images
    try {
      const testResult = await fetchIndividualGFA(site, gfaRegion, 'GFA/CLDWX');
      console.log('GFA Debug Result:', testResult);
      scrapingState.updateStatus(`✅ GFA API test complete for ${site} → ${gfaRegion}`, 'success');
    } catch (error) {
      scrapingState.updateStatus(`❌ GFA API test failed: ${error.message}`, 'error');
    }
  };

  const testIndividualFetches = async () => {
    const site = config.primarySite || "CYYT";
    scrapingState.updateStatus('🔬 Testing individual API call patterns...', 'info');
    
    // Test each image type
    const testImages = ['GFA/CLDWX', 'SATELLITE/IR', 'RADAR/COMPOSITE'];
    
    for (const image of testImages) {
      try {
        console.log(`Testing ${image}...`);
        let result;
        if (image.includes('GFA')) {
          result = await fetchIndividualGFA(site, gfaRegionMapping[site], image);
        } else if (image.includes('SATELLITE')) {
          result = await fetchSatelliteImage(site, image);
        } else if (image.includes('RADAR')) {
          result = await fetchRadarImage(site, image);
        }
        console.log(`${image} result:`, result);
      } catch (error) {
        console.error(`${image} failed:`, error);
      }
    }
    
    scrapingState.updateStatus('🔬 Individual API testing complete', 'success');
  };

  return {
    fetchWeatherData,
    debugGFAAPI,
    testIndividualFetches
  };
};
