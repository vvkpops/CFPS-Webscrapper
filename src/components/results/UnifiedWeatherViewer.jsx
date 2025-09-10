// src/components/results/UnifiedWeatherViewer.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Radio, RefreshCw, Copy, CheckCircle, XCircle, Minus, AlertTriangle, 
  Clock, ServerCrash, Image as ImageIcon, FileText, ChevronLeft, 
  ChevronRight, Cloud, Zap, Wind, Thermometer, Eye, Download, 
  Maximize2, Minimize2, Filter, Search, MapPin, Compass, Activity
} from 'lucide-react';
import { parseRawAlpha, parseUpperWind } from '../../utils/parsers/alphaParsers.js';
import { regionNames, regionColors } from '../../utils/constants/gfaRegions.js';

const UnifiedWeatherViewer = ({ 
  weatherData, 
  isLoading, 
  onRefresh, 
  status,
  config,
  onExport
}) => {
  // State management
  const [selectedStation, setSelectedStation] = useState('');
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, text, imagery, analysis
  const [selectedDataType, setSelectedDataType] = useState('metar');
  const [selectedImageCategory, setSelectedImageCategory] = useState('gfa');
  const [imageViewMode, setImageViewMode] = useState('grid'); // grid, carousel, compare
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [compareStations, setCompareStations] = useState([]);
  
  const availableStations = weatherData ? Object.keys(weatherData) : [];

  useEffect(() => {
    if (availableStations.length > 0 && !availableStations.includes(selectedStation)) {
      setSelectedStation(availableStations[0]);
    }
  }, [availableStations, selectedStation]);

  const stationData = weatherData?.[selectedStation];

  // Data status helper
  const getDataStatus = (data) => {
    if (!data) return { status: 'missing', text: 'NO DATA', Icon: Minus, color: 'text-gray-400' };
    if (data.error) return { status: 'error', text: 'ERROR', Icon: XCircle, color: 'text-red-500' };
    if (data.raw || data.data || data.images || (typeof data === 'object' && !data.error)) {
      return { status: 'available', text: 'OK', Icon: CheckCircle, color: 'text-green-500' };
    }
    return { status: 'unknown', text: 'UNK', Icon: AlertTriangle, color: 'text-yellow-500' };
  };

  // Copy to clipboard
  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Filter data based on search
  const filteredTextData = useMemo(() => {
    if (!stationData?.alpha_data || !searchTerm) return stationData?.alpha_data;
    
    const filtered = {};
    Object.entries(stationData.alpha_data).forEach(([key, value]) => {
      const text = parseRawAlpha(value).toLowerCase();
      if (text.includes(searchTerm.toLowerCase())) {
        filtered[key] = value;
      }
    });
    return filtered;
  }, [stationData, searchTerm]);

  // Loading state
  if (isLoading) {
    return <LoadingState status={status} />;
  }

  // No data state
  if (!stationData) {
    return <NoDataState />;
  }

  // Main render
  return (
    <div className={`bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Professional Header */}
      <WeatherHeader 
        selectedStation={selectedStation}
        availableStations={availableStations}
        setSelectedStation={setSelectedStation}
        stationData={stationData}
        onRefresh={onRefresh}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
      />

      {/* Station Status Bar with Quick Stats */}
      <StationStatusBar 
        selectedStation={selectedStation}
        stationData={stationData}
        getDataStatus={getDataStatus}
      />

      {/* Navigation Tabs */}
      <NavigationTabs 
        activeView={activeView}
        setActiveView={setActiveView}
        stationData={stationData}
      />

      {/* Search/Filter Bar */}
      {activeView === 'text' && (
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      )}

      {/* Main Content Area */}
      <div className="p-6 bg-gray-50/50 min-h-[500px] max-h-[80vh] overflow-y-auto">
        {activeView === 'dashboard' && (
          <DashboardView 
            stationData={stationData}
            getDataStatus={getDataStatus}
            weatherData={weatherData}
            selectedStation={selectedStation}
          />
        )}
        
        {activeView === 'text' && (
          <EnhancedTextView 
            alphaData={filteredTextData}
            selectedDataType={selectedDataType}
            setSelectedDataType={setSelectedDataType}
            copyToClipboard={copyToClipboard}
            copiedField={copiedField}
          />
        )}
        
        {activeView === 'imagery' && (
          <EnhancedImageryView 
            imageData={stationData.image_data}
            selectedCategory={selectedImageCategory}
            setSelectedCategory={setSelectedImageCategory}
            viewMode={imageViewMode}
            setViewMode={setImageViewMode}
          />
        )}
        
        {activeView === 'analysis' && (
          <AnalysisView 
            stationData={stationData}
            weatherData={weatherData}
            selectedStation={selectedStation}
            compareStations={compareStations}
            setCompareStations={setCompareStations}
          />
        )}
      </div>

      {/* Quick Actions Footer */}
      <QuickActionsFooter 
        onExport={onExport}
        stationData={stationData}
        selectedStation={selectedStation}
      />
    </div>
  );
};

// Sub-components

const LoadingState = ({ status }) => (
  <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-12 text-center">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-800 mb-2">Fetching Weather Data...</h3>
    {status?.message && <p className="text-gray-500">{status.message}</p>}
  </div>
);

const NoDataState = () => (
  <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-12 text-center">
    <ServerCrash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Station Data Loaded</h3>
    <p className="text-gray-500">Configure sites and fetch data to begin.</p>
  </div>
);

const WeatherHeader = ({ 
  selectedStation, 
  availableStations, 
  setSelectedStation, 
  stationData, 
  onRefresh,
  isFullscreen,
  setIsFullscreen 
}) => (
  <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-green-400 p-4 font-mono">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Radio className="w-6 h-6 animate-pulse" />
        <h2 className="text-xl font-bold">WEATHER TERMINAL v2.0</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="station-select" className="text-sm">STN:</label>
          <select
            id="station-select"
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-green-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            {availableStations.map(station => (
              <option key={station} value={station}>{station}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>GFA: {stationData?.gfa_region || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{new Date().toUTCString().replace('GMT', 'Z')}</span>
          </div>
        </div>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-gray-900 font-bold rounded hover:bg-green-500 transition-colors"
          aria-label="Refresh weather data"
        >
          <RefreshCw className="w-4 h-4" />
          REFRESH
        </button>
      </div>
    </div>
  </header>
);

const StationStatusBar = ({ selectedStation, stationData, getDataStatus }) => {
  const dataTypes = ['metar', 'taf', 'notam', 'sigmet', 'airmet', 'pirep'];
  
  return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-50 border-y border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-3xl font-bold font-mono text-gray-900">{selectedStation}</h3>
            <p className="font-mono text-sm text-gray-600 flex items-center gap-2">
              <Compass className="w-4 h-4" />
              {regionNames[stationData.gfa_region] || 'Unknown Region'}
              {regionColors[stationData.gfa_region] && (
                <span className="text-lg">{regionColors[stationData.gfa_region]}</span>
              )}
            </p>
          </div>
          {/* Quick Weather Summary */}
          <WeatherSummary alphaData={stationData.alpha_data} />
        </div>
        <div className="grid grid-cols-6 gap-3 font-mono text-xs text-center">
          {dataTypes.map(type => {
            const { Icon, text, color } = getDataStatus(stationData.alpha_data?.[type]);
            return (
              <div key={type} className="group cursor-pointer hover:scale-105 transition-transform">
                <div className="font-bold text-gray-600">{type.toUpperCase()}</div>
                <div className={`flex items-center justify-center gap-1 font-bold ${color}`}>
                  <Icon className="w-3 h-3" />
                  <span>{text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const WeatherSummary = ({ alphaData }) => {
  const metar = parseRawAlpha(alphaData?.metar);
  
  // Extract key weather elements from METAR
  const extractWeatherInfo = (metarText) => {
    if (!metarText) return null;
    
    const info = {
      wind: null,
      visibility: null,
      conditions: null,
      temperature: null
    };
    
    // Wind
    const windMatch = metarText.match(/(\d{3}|VRB)(\d{2,3})(G\d{2,3})?KT/);
    if (windMatch) {
      info.wind = windMatch[0];
    }
    
    // Visibility
    const visMatch = metarText.match(/\s(\d{1,2})SM\s/);
    if (visMatch) {
      info.visibility = visMatch[1] + 'SM';
    }
    
    // Weather conditions
    const conditionsMatch = metarText.match(/\s(-|\+)?(RA|SN|FG|BR|HZ|TS|SH|DZ|GR|FZ)/);
    if (conditionsMatch) {
      info.conditions = conditionsMatch[0].trim();
    }
    
    // Temperature
    const tempMatch = metarText.match(/\s(M?\d{2})\/(M?\d{2})\s/);
    if (tempMatch) {
      info.temperature = tempMatch[1].replace('M', '-') + '°C';
    }
    
    return info;
  };
  
  const weatherInfo = extractWeatherInfo(metar);
  
  if (!weatherInfo) return null;
  
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-white rounded-lg border border-gray-200">
      {weatherInfo.wind && (
        <div className="flex items-center gap-1">
          <Wind className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">{weatherInfo.wind}</span>
        </div>
      )}
      {weatherInfo.visibility && (
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">{weatherInfo.visibility}</span>
        </div>
      )}
      {weatherInfo.temperature && (
        <div className="flex items-center gap-1">
          <Thermometer className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium">{weatherInfo.temperature}</span>
        </div>
      )}
      {weatherInfo.conditions && (
        <div className="flex items-center gap-1">
          <Cloud className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">{weatherInfo.conditions}</span>
        </div>
      )}
    </div>
  );
};

const NavigationTabs = ({ activeView, setActiveView, stationData }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, color: 'blue' },
    { id: 'text', label: 'Text Reports', icon: FileText, color: 'green' },
    { id: 'imagery', label: 'Weather Imagery', icon: ImageIcon, color: 'purple' },
    { id: 'analysis', label: 'Analysis', icon: Compass, color: 'orange' }
  ];
  
  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex" aria-label="Main navigation">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          const colorClasses = {
            blue: isActive ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : '',
            green: isActive ? 'bg-green-50 text-green-700 border-b-2 border-green-700' : '',
            purple: isActive ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-700' : '',
            orange: isActive ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-700' : ''
          };
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                colorClasses[tab.color] || 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
              {tab.id === 'text' && stationData?.alpha_data && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'
                }`}>
                  {Object.keys(stationData.alpha_data).length}
                </span>
              )}
              {tab.id === 'imagery' && stationData?.image_data && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-700'
                }`}>
                  {Object.keys(stationData.image_data).length}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// Continuing from SearchBar component...

const SearchBar = ({ searchTerm, setSearchTerm }) => (
  <div className="bg-white border-b border-gray-200 p-3">
    <div className="max-w-md mx-auto relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search weather reports..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  </div>
);

// Dashboard View Component
const DashboardView = ({ stationData, getDataStatus, weatherData, selectedStation }) => {
  const metar = parseRawAlpha(stationData?.alpha_data?.metar);
  const taf = parseRawAlpha(stationData?.alpha_data?.taf);
  
  // Calculate data completeness
  const totalDataTypes = 10; // Adjust based on your data types
  const availableData = Object.keys(stationData?.alpha_data || {}).filter(
    key => !stationData.alpha_data[key]?.error
  ).length + Object.keys(stationData?.image_data || {}).filter(
    key => !stationData.image_data[key]?.error
  ).length;
  
  const completeness = Math.round((availableData / totalDataTypes) * 100);
  
  return (
    <div className="space-y-6">
      {/* Station Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Conditions Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Current Conditions</h3>
            <Cloud className="w-6 h-6 text-blue-500" />
          </div>
          {metar ? (
            <div className="space-y-2">
              <WeatherMetrics metarText={metar} />
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No METAR data available</p>
          )}
        </div>
        
        {/* Data Completeness Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Data Coverage</h3>
            <Activity className="w-6 h-6 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block uppercase text-green-600">
                    Completeness
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-green-600">
                    {completeness}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                <div 
                  style={{ width: `${completeness}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"
                />
              </div>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>✓ {availableData} data sources active</div>
              <div>⚠ {totalDataTypes - availableData} sources missing</div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
            <Zap className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              📊 Generate Report
            </button>
            <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              📧 Email Summary
            </button>
            <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              🔄 Auto-Refresh: OFF
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent Updates Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Updates</h3>
        <UpdatesTimeline stationData={stationData} />
      </div>
      
      {/* Multi-Station Comparison */}
      {Object.keys(weatherData || {}).length > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Station Comparison</h3>
          <StationComparison weatherData={weatherData} currentStation={selectedStation} />
        </div>
      )}
    </div>
  );
};

// Weather Metrics Component
const WeatherMetrics = ({ metarText }) => {
  const metrics = extractMetricsFromMetar(metarText);
  
  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <metric.icon className={`w-4 h-4 ${metric.color}`} />
          <div>
            <div className="text-xs text-gray-500">{metric.label}</div>
            <div className="text-sm font-semibold">{metric.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Extract metrics helper
const extractMetricsFromMetar = (metar) => {
  const metrics = [];
  
  // Wind
  const windMatch = metar.match(/(\d{3}|VRB)(\d{2,3})(G\d{2,3})?KT/);
  if (windMatch) {
    metrics.push({
      label: 'Wind',
      value: windMatch[0],
      icon: Wind,
      color: 'text-blue-500'
    });
  }
  
  // Visibility
  const visMatch = metar.match(/\s(\d{1,2}|\d\/\d)SM\s/);
  if (visMatch) {
    metrics.push({
      label: 'Visibility',
      value: visMatch[0].trim(),
      icon: Eye,
      color: 'text-green-500'
    });
  }
  
  // Temperature
  const tempMatch = metar.match(/\s(M?\d{2})\/(M?\d{2})\s/);
  if (tempMatch) {
    const temp = tempMatch[1].replace('M', '-');
    metrics.push({
      label: 'Temperature',
      value: `${temp}°C`,
      icon: Thermometer,
      color: 'text-orange-500'
    });
  }
  
  // Altimeter
  const altMatch = metar.match(/A(\d{4})/);
  if (altMatch) {
    metrics.push({
      label: 'Altimeter',
      value: `${altMatch[1]} inHg`,
      icon: Activity,
      color: 'text-purple-500'
    });
  }
  
  return metrics;
};

// Updates Timeline Component
const UpdatesTimeline = ({ stationData }) => {
  const updates = [];
  
  // Collect update times from data
  if (stationData?.fetch_summary?.end_time) {
    updates.push({
      time: new Date(stationData.fetch_summary.end_time),
      type: 'fetch',
      message: 'Data fetch completed'
    });
  }
  
  // Sort by time
  updates.sort((a, b) => b.time - a.time);
  
  return (
    <div className="space-y-3">
      {updates.length > 0 ? (
        updates.slice(0, 5).map((update, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-700">{update.message}</p>
              <p className="text-xs text-gray-500">{update.time.toLocaleTimeString()}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">No recent updates</p>
      )}
    </div>
  );
};

// Station Comparison Component
const StationComparison = ({ weatherData, currentStation }) => {
  const stations = Object.keys(weatherData).slice(0, 4);
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">METAR</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">TAF</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {stations.map(station => (
            <tr key={station} className={station === currentStation ? 'bg-blue-50' : ''}>
              <td className="px-4 py-2 text-sm font-medium text-gray-900">{station}</td>
              <td className="px-4 py-2">
                <StatusIndicator data={weatherData[station]?.alpha_data?.metar} />
              </td>
              <td className="px-4 py-2">
                <StatusIndicator data={weatherData[station]?.alpha_data?.taf} />
              </td>
              <td className="px-4 py-2">
                <span className="text-sm text-gray-600">
                  {Object.keys(weatherData[station]?.image_data || {}).length}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Status Indicator Component
const StatusIndicator = ({ data }) => {
  if (!data) return <Minus className="w-4 h-4 text-gray-400" />;
  if (data.error) return <XCircle className="w-4 h-4 text-red-500" />;
  return <CheckCircle className="w-4 h-4 text-green-500" />;
};

// Enhanced Text View Component
const EnhancedTextView = ({ 
  alphaData, 
  selectedDataType, 
  setSelectedDataType, 
  copyToClipboard, 
  copiedField 
}) => {
  const dataTypes = Object.keys(alphaData || {});
  
  return (
    <div className="space-y-4">
      {/* Data Type Selector */}
      <div className="flex flex-wrap gap-2">
        {dataTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedDataType(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDataType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.toUpperCase()}
            {alphaData[type]?.error && (
              <XCircle className="w-4 h-4 inline ml-2" />
            )}
          </button>
        ))}
      </div>
      
      {/* Selected Data Display */}
      {selectedDataType && alphaData[selectedDataType] && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 flex items-center justify-between">
            <h3 className="font-mono font-bold text-lg">
              {selectedDataType.toUpperCase()}
            </h3>
            <button
              onClick={() => copyToClipboard(parseRawAlpha(alphaData[selectedDataType]), selectedDataType)}
              className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {copiedField === selectedDataType ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="p-4">
            <pre className="font-mono text-sm bg-black text-green-400 p-4 rounded-lg overflow-x-auto">
              {parseRawAlpha(alphaData[selectedDataType])}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Imagery View Component
const EnhancedImageryView = ({ 
  imageData, 
  selectedCategory, 
  setSelectedCategory, 
  viewMode, 
  setViewMode 
}) => {
  const categories = categorizeImages(imageData);
  
  return (
    <div className="space-y-4">
      {/* View Mode Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {Object.keys(categories).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat} ({categories[cat].length})
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('carousel')}
            className={`p-2 rounded ${viewMode === 'carousel' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            Carousel
          </button>
        </div>
      </div>
      
      {/* Image Display */}
      {selectedCategory && categories[selectedCategory] && (
        <ImageDisplay 
          images={categories[selectedCategory]} 
          viewMode={viewMode} 
        />
      )}
    </div>
  );
};

// Helper to categorize images
const categorizeImages = (imageData) => {
  const categories = {};
  
  Object.entries(imageData || {}).forEach(([key, data]) => {
    let category = 'Other';
    if (key.includes('SATELLITE')) category = 'Satellite';
    else if (key.includes('RADAR')) category = 'Radar';
    else if (key.includes('GFA')) category = 'GFA';
    else if (key.includes('SIG_WX')) category = 'SigWx';
    
    if (!categories[category]) categories[category] = [];
    categories[category].push({ key, ...data });
  });
  
  return categories;
};

// Image Display Component
const ImageDisplay = ({ images, viewMode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <img 
              src={img.proxy_url || img.url} 
              alt={img.key}
              className="w-full h-48 object-contain bg-gray-100"
            />
            <div className="p-2 text-xs text-gray-600">
              {img.key}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Carousel view
  return (
    <div className="relative bg-white rounded-lg border border-gray-200 p-4">
      <div className="aspect-w-16 aspect-h-9">
        <img 
          src={images[currentIndex]?.proxy_url || images[currentIndex]?.url}
          alt={images[currentIndex]?.key}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-600">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={() => setCurrentIndex(Math.min(images.length - 1, currentIndex + 1))}
          disabled={currentIndex === images.length - 1}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Analysis View Component
const AnalysisView = ({ 
  stationData, 
  weatherData, 
  selectedStation, 
  compareStations, 
  setCompareStations 
}) => {
  return (
    <div className="space-y-6">
      {/* Trend Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weather Trends</h3>
        <TrendAnalysis stationData={stationData} />
      </div>
      
      {/* Cross-Station Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cross-Station Analysis</h3>
        <CrossStationAnalysis 
          weatherData={weatherData}
          selectedStation={selectedStation}
          compareStations={compareStations}
          setCompareStations={setCompareStations}
        />
      </div>
      
      {/* Data Quality Report */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Quality Report</h3>
        <DataQualityReport stationData={stationData} />
      </div>
    </div>
  );
};

// Trend Analysis Component
const TrendAnalysis = ({ stationData }) => {
  // Analyze patterns in the data
  const trends = [];
  
  if (stationData?.alpha_data?.metar) {
    const metar = parseRawAlpha(stationData.alpha_data.metar);
    if (metar.includes('FEW') || metar.includes('CLR')) {
      trends.push({ type: 'positive', message: 'Clear or few clouds reported' });
    }
    if (metar.includes('RA') || metar.includes('SN')) {
      trends.push({ type: 'warning', message: 'Precipitation reported' });
    }
  }
  
  return (
    <div className="space-y-2">
      {trends.length > 0 ? (
        trends.map((trend, idx) => (
          <div key={idx} className={`p-3 rounded-lg ${
            trend.type === 'positive' ? 'bg-green-50 text-green-800' :
            trend.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
            'bg-gray-50 text-gray-800'
          }`}>
            {trend.message}
          </div>
        ))
      ) : (
        <p className="text-gray-500">No significant trends detected</p>
      )}
    </div>
  );
};

// Cross-Station Analysis Component
const CrossStationAnalysis = ({ weatherData, selectedStation, compareStations, setCompareStations }) => {
  const availableStations = Object.keys(weatherData || {}).filter(s => s !== selectedStation);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {availableStations.map(station => (
          <label key={station} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={compareStations.includes(station)}
              onChange={(e) => {
                if (e.target.checked) {
                  setCompareStations([...compareStations, station]);
                } else {
                  setCompareStations(compareStations.filter(s => s !== station));
                }
              }}
              className="rounded border-gray-300"
            />
            <span className="text-sm">{station}</span>
          </label>
        ))}
      </div>
      
      {compareStations.length > 0 && (
        <div className="mt-4">
          <ComparisonChart 
            weatherData={weatherData}
            stations={[selectedStation, ...compareStations]}
          />
        </div>
      )}
    </div>
  );
};

// Comparison Chart Component
const ComparisonChart = ({ weatherData, stations }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
            {stations.map(station => (
              <th key={station} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                {station}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="px-4 py-2 text-sm font-medium">Data Types</td>
            {stations.map(station => (
              <td key={station} className="px-4 py-2 text-sm">
                {Object.keys(weatherData[station]?.alpha_data || {}).length + 
                 Object.keys(weatherData[station]?.image_data || {}).length}
              </td>
            ))}
          </tr>
          <tr>
            <td className="px-4 py-2 text-sm font-medium">Errors</td>
            {stations.map(station => {
              const errors = [
                ...Object.values(weatherData[station]?.alpha_data || {}).filter(d => d?.error),
                ...Object.values(weatherData[station]?.image_data || {}).filter(d => d?.error)
              ].length;
              return (
                <td key={station} className="px-4 py-2 text-sm">
                  <span className={errors > 0 ? 'text-red-600' : 'text-green-600'}>
                    {errors}
                  </span>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// Data Quality Report Component
const DataQualityReport = ({ stationData }) => {
  const metrics = calculateDataQuality(stationData);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => (
        <div key={idx} className="text-center">
          <div className={`text-2xl font-bold ${metric.color}`}>
            {metric.value}
          </div>
          <div className="text-sm text-gray-600">{metric.label}</div>
        </div>
      ))}
    </div>
  );
};

// Calculate data quality metrics
const calculateDataQuality = (stationData) => {
  const totalFields = Object.keys(stationData?.alpha_data || {}).length + 
                     Object.keys(stationData?.image_data || {}).length;
  const errorFields = [
    ...Object.values(stationData?.alpha_data || {}).filter(d => d?.error),
    ...Object.values(stationData?.image_data || {}).filter(d => d?.error)
  ].length;
  
  const successRate = totalFields > 0 ? Math.round(((totalFields - errorFields) / totalFields) * 100) : 0;
  
  return [
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      color: successRate >= 80 ? 'text-green-600' : successRate >= 50 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      label: 'Total Fields',
      value: totalFields,
      color: 'text-blue-600'
    },
    {
      label: 'Errors',
      value: errorFields,
      color: errorFields > 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      label: 'Last Update',
      value: stationData?.fetch_summary?.end_time ? 
        new Date(stationData.fetch_summary.end_time).toLocaleTimeString() : 'N/A',
      color: 'text-gray-600'
    }
  ];
};

// Quick Actions Footer Component
const QuickActionsFooter = ({ onExport, stationData, selectedStation }) => {
  return (
    <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onExport('json')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={() => onExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            🖨️ Print
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Station: <span className="font-semibold">{selectedStation}</span> | 
          Last Update: {stationData?.fetch_summary?.end_time ? 
            new Date(stationData.fetch_summary.end_time).toLocaleString() : 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default UnifiedWeatherViewer;