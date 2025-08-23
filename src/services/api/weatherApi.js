// services/api/weatherApi.js (Updated with better error handling and alternative endpoints)

import { BASE_API_URL, CORS_PROXY } from '../../utils/constants/apiEndpoints.js';

// Alternative CORS proxies to try if the first one fails
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://thingproxy.freeboard.io/fetch/'
];

// Alternative API endpoints to try
const ALTERNATIVE_ENDPOINTS = [
  'https://plan.navcanada.ca/weather/api/alpha/',
  'https://flightplanning.navcanada.ca/cgi-bin/CreePage.pl?Langue=anglais&Page=forecast&TypeDoc=html',
  'https://plan.navcanada.ca/weather/cgi-bin/alpha.pl'
];

// Test if an endpoint is accessible
const testEndpoint = async (url) => {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      timeout: 5000 
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Find the best working CORS proxy and API endpoint combination
const findWorkingEndpoint = async () => {
  console.log('🔍 Testing API endpoints and CORS proxies...');
  
  for (const proxy of CORS_PROXIES) {
    for (const endpoint of ALTERNATIVE_ENDPOINTS) {
      try {
        const testUrl = proxy + encodeURIComponent(endpoint + 'site=CYUL&alpha=metar');
        const isWorking = await testEndpoint(testUrl);
        
        if (isWorking) {
          console.log(`✅ Found working combination: ${proxy} + ${endpoint}`);
          return { proxy, endpoint };
        }
      } catch (error) {
        continue;
      }
    }
  }
  
  console.warn('⚠️ No working API endpoints found, using defaults');
  return { proxy: CORS_PROXIES[0], endpoint: ALTERNATIVE_ENDPOINTS[0] };
};

// Cache the working endpoint
let workingEndpoint = null;

const getWorkingEndpoint = async () => {
  if (!workingEndpoint) {
    workingEndpoint = await findWorkingEndpoint();
  }
  return workingEndpoint;
};

export const fetchIndividualAlpha = async (site, alpha) => {
  const { proxy, endpoint } = await getWorkingEndpoint();
  
  // Try multiple parameter formats
  const parameterFormats = [
    // Original format
    `site=${site}&alpha=${alpha}&notam_choice=default`,
    // Alternative formats
    `site=${site}&product=${alpha}`,
    `icao=${site}&type=${alpha}`,
    `location=${site}&data=${alpha}`,
  ];

  for (const params of parameterFormats) {
    try {
      const fullParams = `${params}&_=${Date.now()}`;
      const url = proxy + encodeURIComponent(endpoint + fullParams);
      
      console.log(`🌐 Trying: ${alpha} for ${site} with params: ${params}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'CFPS-WxRecall-Scraper/1.0'
        },
        timeout: 10000
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success: ${alpha} for ${site}`);
        return data;
      } else {
        console.warn(`⚠️ HTTP ${response.status} for ${alpha} at ${site} with params: ${params}`);
      }
    } catch (error) {
      console.warn(`❌ Error with ${alpha} for ${site}: ${error.message}`);
    }
  }

  // If all formats fail, try direct access without CORS proxy (for testing)
  try {
    console.log(`🔄 Trying direct access for ${alpha} at ${site}...`);
    const directUrl = `${endpoint}site=${site}&alpha=${alpha}&_=${Date.now()}`;
    const response = await fetch(directUrl);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Direct access success: ${alpha} for ${site}`);
      return data;
    }
  } catch (error) {
    console.warn(`❌ Direct access failed for ${alpha} at ${site}: ${error.message}`);
  }

  throw new Error(`All methods failed for ${alpha} at ${site}. API may be down or endpoints changed.`);
};

export const fetchIndividualImage = async (site, image) => {
  const { proxy, endpoint } = await getWorkingEndpoint();
  
  // Try multiple parameter formats for images
  const parameterFormats = [
    // Original format
    `site=${site}&image=${image}`,
    // Alternative formats
    `site=${site}&product=${image}`,
    `location=${site}&chart=${image}`,
    `icao=${site}&type=${image}`,
  ];

  for (const params of parameterFormats) {
    try {
      const fullParams = `${params}&_=${Date.now()}`;
      const url = proxy + encodeURIComponent(endpoint + fullParams);
      
      console.log(`🖼️ Trying: ${image} for ${site} with params: ${params}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'CFPS-WxRecall-Scraper/1.0'
        },
        timeout: 10000
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success: ${image} for ${site}`);
        return data;
      } else {
        console.warn(`⚠️ HTTP ${response.status} for ${image} at ${site} with params: ${params}`);
      }
    } catch (error) {
      console.warn(`❌ Error with ${image} for ${site}: ${error.message}`);
    }
  }

  throw new Error(`All methods failed for ${image} at ${site}. API may be down or endpoints changed.`);
};

// Test function to check API accessibility
export const testAPIConnectivity = async () => {
  console.log('🔧 Testing API connectivity...');
  
  const testResults = {
    corsProxies: [],
    apiEndpoints: [],
    recommendations: []
  };

  // Test CORS proxies
  for (const proxy of CORS_PROXIES) {
    try {
      const testUrl = proxy + encodeURIComponent('https://httpbin.org/json');
      const response = await fetch(testUrl, { timeout: 5000 });
      const working = response.ok;
      
      testResults.corsProxies.push({
        proxy,
        working,
        status: response.status
      });
    } catch (error) {
      testResults.corsProxies.push({
        proxy,
        working: false,
        error: error.message
      });
    }
  }

  // Test API endpoints directly (will fail due to CORS but shows if endpoints exist)
  for (const endpoint of ALTERNATIVE_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, { 
        method: 'HEAD',
        timeout: 5000 
      });
      testResults.apiEndpoints.push({
        endpoint,
        accessible: true,
        status: response.status
      });
    } catch (error) {
      testResults.apiEndpoints.push({
        endpoint,
        accessible: false,
        error: error.message
      });
    }
  }

  // Generate recommendations
  const workingProxies = testResults.corsProxies.filter(p => p.working);
  const accessibleEndpoints = testResults.apiEndpoints.filter(e => e.accessible);

  if (workingProxies.length === 0) {
    testResults.recommendations.push('❌ No working CORS proxies found. You may need to run this from a server or use a different proxy service.');
  }

  if (accessibleEndpoints.length === 0) {
    testResults.recommendations.push('❌ No accessible API endpoints found. The Nav Canada API may be down or endpoints have changed.');
  }

  if (workingProxies.length > 0 && accessibleEndpoints.length > 0) {
    testResults.recommendations.push('✅ Found working proxies and endpoints. Try the fetch operation again.');
  }

  console.log('🔧 API Connectivity Test Results:', testResults);
  return testResults;
};
