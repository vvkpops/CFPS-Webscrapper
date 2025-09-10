// src/components/viewer/UnifiedView.jsx
import React, { useState } from 'react';
import { 
  MapPin, FileText, Image, AlertCircle, Clock, 
  CheckCircle, XCircle, Copy, Maximize2 
} from 'lucide-react';
import { parseRawAlpha } from '../../utils/parsers/alphaParsers.js';
import { regionNames } from '../../utils/constants/gfaRegions.js';

const UnifiedView = ({ weatherData, selectedSite, setSelectedSite, fetchProgress }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [copiedField, setCopiedField] = useState('');
  const [expandedImage, setExpandedImage] = useState(null);

  const sites = Object.keys(weatherData);
  const siteData = weatherData[selectedSite] || {};

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getDataStatus = (data) => {
    if (!data) return { icon: AlertCircle, color: 'text-gray-400' };
    if (data.error) return { icon: XCircle, color: 'text-red-500' };
    if (data.raw || data.data || data.images) return { icon: CheckCircle, color: 'text-green-500' };
    return { icon: AlertCircle, color: 'text-yellow-500' };
  };

  return (
    <div className="h-full flex">
      {/* Site Selector */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Sites ({sites.length})
          </h3>
          <div className="space-y-1">
            {sites.map(site => {
              const data = weatherData[site];
              const hasError = data?.error;
              const dataCount = (data?.alpha_data ? Object.keys(data.alpha_data).length : 0) + 
                               (data?.image_data ? Object.keys(data.image_data).length : 0);
              
              return (
                <button
                  key={site}
                  onClick={() => setSelectedSite(site)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedSite === site
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-600'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {site}
                      </span>
                    </div>
                    {hasError ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {dataCount}
                      </span>
                    )}
                  </div>
                  {data?.gfa_region && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-6">
                      {regionNames[data.gfa_region]}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Data Display */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Site
