// components/results/ProfessionalWeatherTerminal.jsx

import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  RefreshCw,
  Copy,
  CheckCircle,
  XCircle,
  Minus,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { parseRawAlpha } from '../../utils/parsers/alphaParsers.js';
import { regionNames } from '../../utils/constants/gfaRegions.js';
import WeatherImageryViewer from './WeatherImageryViewer.jsx';

const ProfessionalWeatherTerminal = ({ weatherData, isLoading, onRefresh, status }) => {
  const [selectedStation, setSelectedStation] = useState('');
  const [activeTab, setActiveTab] = useState('text');
  const [copiedField, setCopiedField] = useState('');

  const availableStations = weatherData ? Object.keys(weatherData) : [];

  useEffect(() => {
    if (availableStations.length > 0 && !selectedStation) {
      setSelectedStation(availableStations[0]);
    }
  }, [availableStations, selectedStation]);

  const stationData = weatherData?.[selectedStation];

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getDataStatus = (data) => {
    if (!data) return { status: 'missing', text: 'NO DATA', color: 'text-gray-400', icon: Minus };
    if (data.error) return { status: 'error', text: 'ERROR', color: 'text-red-600', icon: XCircle };
    if (data.raw || data.data || data.images || (typeof data === 'object' && !data.error)) {
      return { status: 'available', text: 'AVAIL', color: 'text-green-600', icon: CheckCircle };
    }
    return { status: 'unknown', text: 'UNK', color: 'text-yellow-600', icon: AlertTriangle };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Fetching Weather Data</h3>
        <p className="text-gray-500">Retrieving current weather information...</p>
        {status && status.message && (
          <p className="text-sm text-gray-400 mt-2">{status.message}</p>
        )}
      </div>
    );
  }

  if (!stationData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Radio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Station Data</h3>
        <p className="text-gray-500">Configure sites and fetch data to begin</p>
        {status && status.message && (
          <p className="text-sm text-gray-400 mt-2">{status.message}</p>
        )}
      </div>
    );
  }

  // Prepare data types and status
  const dataTypes = ['metar', 'taf', 'notam', 'sigmet', 'airmet', 'pirep'];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-gray-900 text-green-400 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Radio className="w-6 h-6" />
            <h2 className="text-xl font-bold font-mono">WEATHER DATA TERMINAL</h2>
            
            {/* Station Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm">STN:</span>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-green-400 font-mono focus:ring-2 focus:ring-green-500"
              >
                {availableStations.map(station => (
                  <option key={station} value={station}>{station}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div>GFA: {stationData.gfa_region}</div>
              <div>{new Date().toLocaleString('en-US', { 
                timeZone: 'UTC',
                month: '2-digit',
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit'
              }).replace(/[\/,]/g, '').replace(' ', '') + 'Z'}</div>
            </div>
            
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              REFRESH
            </button>
          </div>
        </div>
      </div>

      {/* Station Status Bar */}
      <div className="bg-gray-100 border-b border-gray-400 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <div className="text-3xl font-bold font-mono text-gray-900">{selectedStation}</div>
              <div className="font-mono text-sm text-gray-600">
                GFA: {stationData.gfa_region} • {regionNames[stationData.gfa_region] || 'UNKNOWN REGION'}
              </div>
            </div>
            
            <div className="font-mono text-sm">
              <div className="text-gray-600">FETCH STATUS</div>
              <div className="font-bold text-lg">
                <span className="text-green-600">{stationData.fetch_summary?.successful_requests || 0}</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900">{stationData.fetch_summary?.total_requests || 0}</span>
              </div>
            </div>
          </div>
          
          {/* Data Availability Status */}
          <div className="grid grid-cols-6 gap-3 font-mono text-xs">
            {dataTypes.map(type => {
              const data = stationData.alpha_data?.[type];
              const status = getDataStatus(data);
              const Icon = status.icon;
              return (
                <div key={type} className="text-center">
                  <div className="font-bold text-gray-700">{type.toUpperCase()}</div>
                  <div className={`flex items-center justify-center gap-1 ${status.color}`}>
                    <Icon className="w-3 h-3" />
                    <span className="font-bold">{status.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Data Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'text'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            📋 TEXT REPORTS
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'images'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            🗺️ WEATHER IMAGERY
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'text' && (
          <TextReportsTab 
            alphaData={stationData.alpha_data}
            getDataStatus={getDataStatus}
            copyToClipboard={copyToClipboard}
            copiedField={copiedField}
          />
        )}
        
        {activeTab === 'images' && (
          <WeatherImageryViewer 
            imageData={stationData.image_data}
            getDataStatus={getDataStatus}
          />
        )}
      </div>
    </div>
  );
};

// Text Reports Tab Component
const TextReportsTab = ({ alphaData, getDataStatus, copyToClipboard, copiedField }) => {
  if (!alphaData || Object.keys(alphaData).length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Text Data</h3>
        <p className="text-gray-500">No alphanumeric weather data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(alphaData).map(([dataType, data]) => {
        const status = getDataStatus(data);
        const displayText = parseRawAlpha(data) || (data?.error ? `Error: ${data.error}` : 'No data');
        const Icon = status.icon;

        return (
          <div key={dataType} className="border border-gray-300 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h4 className="font-mono font-bold text-lg text-gray-900">
                  {dataType.toUpperCase()}
                </h4>
                <div className={`flex items-center gap-1 ${status.color}`}>
                  <Icon className="w-4 h-4" />
                  <span className="font-bold text-sm">{status.text}</span>
                </div>
              </div>
              
              {!data?.error && (
                <button
                  onClick={() => copyToClipboard(displayText, dataType)}
                  className="flex items-center gap-2 px-3 py-1 border border-gray-400 rounded hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm font-mono">
                    {copiedField === dataType ? 'COPIED!' : 'COPY'}
                  </span>
                </button>
              )}
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className={`font-mono text-sm p-4 rounded border-2 whitespace-pre-line ${
                data?.error 
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-black border-gray-600 text-green-400'
              }`}>
                {displayText}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProfessionalWeatherTerminal;
