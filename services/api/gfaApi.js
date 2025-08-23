// services/api/gfaApi.js

import { BASE_API_URL, CORS_PROXY, IMAGE_BASE_URLS, GFA_TIME_PERIODS } from '../../utils/constants/apiEndpoints.js';

export const fetchDirectGFAImages = async (site, gfaRegion, gfaType) => {
  const gfaProduct = gfaType.split('/')[1]?.toLowerCase() || 'cldwx';
  
  const directGFAData = {
    type: 'direct_gfa_images',
    gfa_region: gfaRegion,
    site: site,
    product: gfaProduct,
    images: []
  };

  const imageBaseUrls = [
    IMAGE_BASE_URLS.flightPlanning,
    IMAGE_BASE_URLS.weather,
    IMAGE_BASE_URLS.static
  ];

  for (const period of GFA_TIME_PERIODS) {
    for (const baseUrl of imageBaseUrls) {
      try {
        const imageUrl = `${baseUrl}${gfaRegion.toLowerCase()}_${gfaProduct}_${period}.gif`;
        const proxyUrl = CORS_PROXY + encodeURIComponent(imageUrl);
        const response = await fetch(proxyUrl, { method: 'HEAD' });
        
        if (response.ok) {
          directGFAData.images.push({
            period: period,
            url: imageUrl,
            proxy_url: proxyUrl,
            content_type: response.headers.get('content-type')
          });
          break;
        }
      } catch (error) {
        continue;
      }
    }
  }

  return directGFAData;
};

export const fetchIndividualGFA = async (site, gfaRegion, gfaType) => {
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
      const url = CORS_PROXY + encodeURIComponent(BASE_API_URL + params);

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
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

  return await fetchDirectGFAImages(site, gfaRegion, gfaType);
};
