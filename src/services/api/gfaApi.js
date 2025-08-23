// services/api/gfaApi.js (Fixed to match working HTML version exactly)

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

export const fetchDirectGFAImages = async (site, gfaRegion, gfaType) => {
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
};
