// services/api/weatherApi.js (Fixed to match working HTML version exactly)

export const fetchIndividualAlpha = async (site, alpha) => {
  const params = new URLSearchParams();
  params.set("site", site);
  params.set("alpha", alpha);
  params.set("notam_choice", "default");
  params.set("_", Date.now());

  const url = "https://corsproxy.io/?" + encodeURIComponent(
    "https://plan.navcanada.ca/weather/api/alpha/?" + params.toString()
  );

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export const fetchIndividualImage = async (site, image) => {
  const params = new URLSearchParams();
  params.set("site", site);
  params.set("image", image);
  params.set("_", Date.now());

  const url = "https://corsproxy.io/?" + encodeURIComponent(
    "https://plan.navcanada.ca/weather/api/alpha/?" + params.toString()
  );

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export const fetchIndividualGFA = async (site, gfaRegion, gfaType) => {
  // Try multiple GFA API patterns exactly like the working HTML version
  const gfaPatterns = [
    `site=${site}&image=GFA/${gfaRegion}/${gfaType.split('/')[1]}`,
    `site=${site}&gfa_region=${gfaRegion}&image=${gfaType}`,
    `gfa_region=${gfaRegion}&image=${gfaType}`,
    `site=${site}&alpha=gfa&gfa_region=${gfaRegion}`,
    `site=${site}&image=${gfaType}&region=${gfaRegion}`
  ];

  for (const pattern of gfaPatterns) {
    try {
      const params = pattern + `&_=${Date.now()}`;
      const url = "https://corsproxy.io/?" + encodeURIComponent(
        "https://plan.navcanada.ca/weather/api/alpha/?" + params
      );

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        // Check if we got meaningful GFA data
        const hasGFAData = Object.keys(data).some(key => 
          key.toLowerCase().includes('gfa') || 
          (data[key] && Array.isArray(data[key]) && data[key].length > 0)
        );
        
        if (hasGFAData) {
          return {
            ...data,
            gfa_pattern_used: pattern,
            gfa_region: gfaRegion
          };
        }
      }
    } catch (error) {
      console.warn(`GFA pattern ${pattern} failed:`, error);
      continue;
    }
  }

  // If all patterns fail, try direct GFA image URLs
  return await fetchDirectGFAImages(site, gfaRegion, gfaType);
};

async function fetchDirectGFAImages(site, gfaRegion, gfaType) {
  const gfaProduct = gfaType.split('/')[1]?.toLowerCase() || 'cldwx';
  const timePeriods = ['000', '006', '012', '018'];
  
  const directGFAData = {
    type: 'direct_gfa_images',
    gfa_region: gfaRegion,
    site: site,
    product: gfaProduct,
    images: []
  };

  for (const period of timePeriods) {
    const imageUrls = [
      `https://flightplanning.navcanada.ca/Latest/gfa/anglais/images/${gfaRegion.toLowerCase()}_${gfaProduct}_${period}.gif`,
      `https://plan.navcanada.ca/weather/images/gfa/${gfaRegion.toLowerCase()}_${gfaProduct}_${period}.gif`,
      `https://plan.navcanada.ca/static/gfa/${gfaRegion.toLowerCase()}_${gfaProduct}_${period}.gif`
    ];

    for (const imageUrl of imageUrls) {
      try {
        const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(imageUrl);
        const response = await fetch(proxyUrl, { method: 'HEAD' });
        
        if (response.ok) {
          directGFAData.images.push({
            period: period,
            url: imageUrl,
            proxy_url: proxyUrl,
            content_type: response.headers.get('content-type')
          });
          break; // Found working URL for this period
        }
      } catch (error) {
        continue; // Try next URL
      }
    }
  }

  return directGFAData;
}

// Test function to check API accessibility
export const testAPIConnectivity = async () => {
  console.log('🔧 Testing API connectivity...');
  
  const testResults = {
    corsProxies: [],
    apiEndpoints: [],
    recommendations: []
  };

  // CORS proxies to test
  const CORS_PROXIES = [
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/raw?url=',
    'https://thingproxy.freeboard.io/fetch/'
  ];

  // API endpoints to test
  const API_ENDPOINTS = [
    'https://plan.navcanada.ca/weather/api/alpha/',
    'https://flightplanning.navcanada.ca/cgi-bin/CreePage.pl?Langue=anglais&Page=forecast&TypeDoc=html',
    'https://plan.navcanada.ca/weather/cgi-bin/alpha.pl'
  ];

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
  for (const endpoint of API_ENDPOINTS) {
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
