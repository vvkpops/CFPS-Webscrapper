// components/results/EnhancedTabbedResults.jsx

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  FileText, 
  Image as ImageIcon, 
  Plane,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import Card from '../common/Card.jsx';
import Tabs from '../common/Tabs.jsx';
import Button from '../common/Button.jsx';
import EnhancedResultsOverview from './EnhancedResultsOverview.jsx';
import EnhancedAlphanumericResults from './EnhancedAlphanumericResults.jsx';
import EnhancedImageResults from './EnhancedImageResults.jsx';

const { Panel: TabPanel } = Tabs;

const SiteSelector = ({ sites, activeSite, onSiteChange, siteData }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getSiteStatus = (site) => {
    const data = siteData[site];
    if (!data) return 'unknown';
    if (data.error) return 'error';
    
    const alphaCount = data.alpha_data ? Object.keys(data.alpha_data).length : 0;
    const imageCount = data.image_data ? Object.keys(data.image_data).length : 0;
    const totalTypes = alphaCount + imageCount;
    
    if (totalTypes === 0) return 'empty';
    
    let successCount = 0;
    if (data.alpha_data) {
      Object.values(data.alpha_data).forEach(d => {
        if (d && !d.error) successCount++;
      });
    }
    if (data.image_data) {
      Object.values(data.image_data).forEach(d => {
        if (d && !d.error) successCount++;
      });
    }
    
    const successRate = totalTypes > 0 ? (successCount / totalTypes) : 0;
    if (successRate >= 0.8) return 'good';
    if (successRate >= 0.5) return 'partial';
    return 'poor';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'empty': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return '✅';
      case 'partial': return '⚠️';
      case 'poor': return '🟠';
      case 'error': return '❌';
      case 'empty': return '⭕';
      default: return '❓';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 hover:border-blue-400 hover:shadow-md transition-all duration-200 min-w-[200px]"
      >
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-800">{activeSite}</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(getSiteStatus(activeSite))}`}>
            {getStatusIcon(getSiteStatus(activeSite))}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {sites.map(site => {
            const status = getSiteStatus(site);
            const data = siteData[site];
            const alphaCount = data?.alpha_data ? Object.keys(data.alpha_data).length : 0;
            const imageCount = data?.image_data ? Object.keys(data.image_data).length : 0;
            
            return (
              <button
                key={site}
                onClick={() => {
                  onSiteChange(site);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors ${
                  site === activeSite ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Plane className="w-4 h-4 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-800">{site}</div>
                    <div className="text-xs text-gray-500">
                      {alphaCount} reports, {imageCount} images
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const EnhancedTabbedResults = ({ results, onRefresh }) => {
  const [activeSite, setActiveSite] = useState('');

  useEffect(() => {
    if (results && Object.keys(results).length > 0 && !activeSite) {
      setActiveSite(Object.keys(results)[0]);
    }
  }, [results, activeSite]);

  if (!results || Object.keys(results).length === 0) {
    return (
      <Card borderColor="gray-300" className="text-center py-12">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <BarChart3 className="w-10 h-10 text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">📋 Weather Data Results</h2>
            <p className="text-gray-500 text-lg mb-2">No data available yet</p>
            <p className="text-gray-400">Run a fetch operation to see comprehensive weather data and imagery</p>
          </div>
          <div className="pt-4">
            <div className="inline-flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Text Reports</span>
              </div>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>Weather Imagery</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Performance Stats</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const sites = Object.keys(results);
  const currentSiteData = results[activeSite] || {};

  // Calculate overall statistics for the current site
  const getTabCounts = () => {
    const alphaCount = currentSiteData.alpha_data ? Object.keys(currentSiteData.alpha_data).length : 0;
    const imageCount = currentSiteData.image_data ? Object.keys(currentSiteData.image_data).length : 0;
    
    // Count successful items
    let alphaSuccess = 0;
    let imageSuccess = 0;
    
    if (currentSiteData.alpha_data) {
      Object.values(currentSiteData.alpha_data).forEach(data => {
        if (data && !data.error) alphaSuccess++;
      });
    }
    
    if (currentSiteData.image_data) {
      Object.values(currentSiteData.image_data).forEach(data => {
        if (data && !data.error) imageSuccess++;
      });
    }
    
    return { alphaCount, imageCount, alphaSuccess, imageSuccess };
  };

  const { alphaCount, imageCount, alphaSuccess, imageSuccess } = getTabCounts();

  return (
    <Card borderColor="gray-300" className="overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Weather Data Results
          </h2>
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="secondary"
              size="sm"
              icon={RefreshCw}
            >
              Refresh Data
            </Button>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SiteSelector
              sites={sites}
              activeSite={activeSite}
              onSiteChange={setActiveSite}
              siteData={results}
            />
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white bg-opacity-50 px-3 py-2 rounded-lg">
                <FileText className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">{alphaSuccess}/{alphaCount} Reports</span>
              </div>
              <div className="flex items-center gap-2 bg-white bg-opacity-50 px-3 py-2 rounded-lg">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700">{imageSuccess}/{imageCount} Images</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">
              {sites.length} site{sites.length !== 1 ? 's' : ''} • Last updated{' '}
              {currentSiteData.fetch_summary?.end_time 
                ? new Date(currentSiteData.fetch_summary.end_time).toLocaleTimeString()
                : 'Unknown'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="p-6">
        <Tabs defaultTab="overview">
          <TabPanel 
            key="overview" 
            value="overview" 
            label="📊 Overview"
            activeColor="bg-blue-600 text-white border-b-4 border-blue-600"
          >
            <EnhancedResultsOverview siteData={currentSiteData} />
          </TabPanel>
          
          <TabPanel 
            key="alpha" 
            value="alpha" 
            label="📋 Text Reports"
            count={alphaCount > 0 ? `${alphaSuccess}/${alphaCount}` : undefined}
            activeColor="bg-green-600 text-white border-b-4 border-green-600"
          >
            <EnhancedAlphanumericResults 
              alphaData={currentSiteData?.alpha_data} 
              activeSite={activeSite} 
            />
          </TabPanel>
          
          <TabPanel 
            key="images" 
            value="images" 
            label="🗺️ Weather Imagery"
            count={imageCount > 0 ? `${imageSuccess}/${imageCount}` : undefined}
            activeColor="bg-purple-600 text-white border-b-4 border-purple-600"
          >
            <EnhancedImageResults imageData={currentSiteData?.image_data} />
          </TabPanel>
        </Tabs>
      </div>
    </Card>
  );
};

export default EnhancedTabbedResults;
