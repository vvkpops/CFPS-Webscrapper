// services/export/exportService.js

import { regionNames } from '../../utils/constants/gfaRegions.js';

export const useExportData = () => {
  const exportJSON = (allData) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const jsonStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wxrecall_data_${timestamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = (allData) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    let csvContent = "Timestamp,Site,DataType,Content,Status\n";
    
    allData.forEach(session => {
      session.data && Object.keys(session.data).forEach(site => {
        const siteData = session.data[site];
        
        // Alpha data
        if (siteData.alpha_data) {
          Object.keys(siteData.alpha_data).forEach(alphaType => {
            const alphaData = siteData.alpha_data[alphaType];
            const status = alphaData.error ? 'Failed' : 'Success';
            const content = alphaData.error ? 
              `Error: ${alphaData.error}` : 
              JSON.stringify(alphaData).substring(0, 100);
            csvContent += `"${session.timestamp}","${site}","${alphaType}","${content.replace(/"/g, '""')}","${status}"\n`;
          });
        }
        
        // Image data  
        if (siteData.image_data) {
          Object.keys(siteData.image_data).forEach(imageType => {
            const imageData = siteData.image_data[imageType];
            const status = imageData.error ? 'Failed' : 'Success';
            const content = imageData.error ? 
              `Error: ${imageData.error}` : 
              JSON.stringify(imageData).substring(0, 100);
            csvContent += `"${session.timestamp}","${site}","${imageType}","${content.replace(/"/g, '""')}","${status}"\n`;
          });
        }
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wxrecall_data_${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportHTML = (allData, stats, results, config) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const avgResponseTime = stats.responseTimes.length > 0 ? 
      Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length) : 0;
      
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>WxRecall Scraping Report - ${new Date().toLocaleDateString()}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f8f9fa; }
    .header { background: #3498db; color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
    .stat { background: white; padding: 15px; text-align: center; border-radius: 8px; border: 1px solid #dee2e6; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-number { font-size: 2em; font-weight: bold; color: #2c3e50; }
    .stat-label { color: #6c757d; font-size: 0.9em; }
    .data-section { margin: 20px 0; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .site-section { margin: 20px 0; padding: 15px; border-left: 4px solid #3498db; background: #f8f9fa; }
    .config-info { background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    h1, h2, h3 { color: #2c3e50; }
    h1 { margin: 0; }
    h2 { border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
    .summary-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌤️ WxRecall Scraping Report</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="config-info">
    <h3>📋 Configuration Summary</h3>
    <div class="summary-grid">
      <div><strong>Primary Site:</strong> ${config.primarySite}</div>
      <div><strong>Additional Sites:</strong> ${config.additionalSites.join(', ') || 'None'}</div>
      <div><strong>Scrape Interval:</strong> ${config.interval} seconds</div>
      <div><strong>Request Delay:</strong> ${config.requestDelay} ms</div>
    </div>
  </div>
  
  <div class="stats">
    <div class="stat">
      <div class="stat-number">${stats.total}</div>
      <div class="stat-label">Total Requests</div>
    </div>
    <div class="stat">
      <div class="stat-number">${stats.successful}</div>
      <div class="stat-label">Successful</div>
    </div>
    <div class="stat">
      <div class="stat-number">${stats.failed}</div>
      <div class="stat-label">Failed</div>
    </div>
    <div class="stat">
      <div class="stat-number">${stats.dataPoints}</div>
      <div class="stat-label">Data Points</div>
    </div>
    <div class="stat">
      <div class="stat-number">${avgResponseTime}ms</div>
      <div class="stat-label">Avg Response Time</div>
    </div>
  </div>
  
  <div class="data-section">
    <h2>📊 Session Summary</h2>
    <div class="summary-grid">
      <div class="summary-card">
        <strong>Sites Processed:</strong> ${Object.keys(results).length}<br>
        <strong>Site List:</strong> ${Object.keys(results).join(', ')}
      </div>
      <div class="summary-card">
        <strong>Total Sessions:</strong> ${allData.length}<br>
        <strong>Success Rate:</strong> ${stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}%
      </div>
    </div>
  </div>

  <div class="data-section">
    <h2>🛩️ Site Details</h2>
    ${Object.entries(results).map(([site, siteData]) => `
      <div class="site-section">
        <h3>${site}</h3>
        ${siteData.error ? `
          <div style="color: #dc3545; padding: 10px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">
            <strong>Error:</strong> ${siteData.error}
          </div>
        ` : `
          <div class="summary-grid">
            ${siteData.fetch_summary ? `
              <div class="summary-card">
                <strong>Fetch Summary</strong><br>
                Total: ${siteData.fetch_summary.total_requests}<br>
                Success: ${siteData.fetch_summary.successful_requests}<br>
                Failed: ${siteData.fetch_summary.failed_requests}<br>
                Data Points: ${siteData.fetch_summary.data_points}
              </div>
            ` : ''}
            ${siteData.gfa_region ? `
              <div class="summary-card">
                <strong>GFA Region</strong><br>
                Region: ${siteData.gfa_region}<br>
                Region Name: ${regionNames[siteData.gfa_region] || 'Unknown'}
              </div>
            ` : ''}
            <div class="summary-card">
              <strong>Data Types</strong><br>
              Alpha: ${siteData.alpha_data ? Object.keys(siteData.alpha_data).length : 0} types<br>
              Images: ${siteData.image_data ? Object.keys(siteData.image_data).length : 0} types
            </div>
          </div>
        `}
      </div>
    `).join('')}
  </div>

  <div class="data-section">
    <h2>ℹ️ Report Information</h2>
    <p><strong>Generated By:</strong> CFPS WxRecall Scraper</p>
    <p><strong>Report Date:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Data Source:</strong> Nav Canada CFPS WxRecall API</p>
    <p><strong>Total Data Sessions:</strong> ${allData.length}</p>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wxrecall_report_${timestamp}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return { exportJSON, exportCSV, exportHTML };
};
