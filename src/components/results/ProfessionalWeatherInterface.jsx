// components/results/ProfessionalWeatherInterface.jsx
// Clean, professional interface for dispatchers and pilots - RAW DATA FOCUS

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  RefreshCw,
  ArrowLeft,
  Copy,
  Plane,
  Radio,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Minus
} from 'lucide-react';
import { parseRawAlpha } from '../../utils/parsers/alphaParsers.js';
import { regionNames } from '../../utils/constants/gfaRegions.js';

const ProfessionalWeatherInterface = ({ results, onBack, onRefresh }) => {
  const [selectedStation, setSelectedStation] = useState('');
  const [copiedField, setCopiedField] = useState('');

  const availableStations = results ? Object.keys(results) : [];

  useEffect(() => {
    if (availableStations.length > 0 && !selectedStation) {
      setSelectedStation(availableStations[0]);
    }
  }, [availableStations, selectedStation]);

  const stationData = results?.[selectedStation];

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
    if (data.raw || data.data || (typeof data === 'object' && !data.error)) {
      return { status: 'available', text: 'AVAIL', color: 'text-green-600', icon: CheckCircle };
    }
    return { status: 'unknown', text: 'UNK', color: 'text-yellow-600', icon: AlertTriangle };
  };

  const extractObsTime = (metarText) => {
    if (!metarText) return 'N/A';
    const match = metarText.match(/(\d{6})Z/);
    if (match) {
      const timeStr = match[1];
      const day = timeStr.slice(0, 2);
      const hour = timeStr.slice(2, 4);
      const min = timeStr.slice(4, 6);
      return `${day}${hour}${min}Z`;
    }
    return 'N/A';
  };

  const extractValidTime = (tafText) => {
    if (!tafText) return 'N/A';
    const match = tafText.match(/(\d{6})Z\s+(\d{4})\/(\d{4})/);
    if (match) {
      const validFrom = match[2];
      const validTo = match[3];
      return `${validFrom}-${validTo}Z`;
    }
    return 'N/A';
  };

  const getRawData = (dataObject) => {
    if (!dataObject) return null;
    if (dataObject.error) return { error: dataObject.error };
    if (dataObject.raw) return { raw: dataObject.raw };
    
    // Use your existing parser
    const parsed = parseRawAlpha(dataObject);
    return parsed ? { raw: parsed } : { error: 'No data available' };
  };

  if (!stationData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">NO STATION DATA</h2>
          <p className="text-gray-500 font-mono">SELECT STATION TO VIEW WX DATA</p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO RESULTS
            </button>
          )}
        </div>
      </div>
    );
  }

  // Prepare data for display
  const dataTypes = ['metar', 'taf', 'notam', 'sigmet', 'airmet', 'pirep'];
  const availableData = dataTypes.filter(type => stationData.alpha_data?.[type]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Aviation Professional Style */}
      <div className="border-b-2 border-gray-300 bg-gray-50">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-mono text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  BACK
                </button>
              )}
              
              <div className="flex items-center gap-3">
                <Radio className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold font-mono text-gray-900">WEATHER DATA TERMINAL</h1>
              </div>
              
              {/* Station Selector */}
              <div className="flex items-center gap-2">
                <label className="font-mono text-sm text-gray-600">STN:</label>
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-400 rounded font-mono text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {availableStations.map(station => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right font-mono text-sm">
                <div className="text-gray-600">LAST UPDATE</div>
                <div className="font-bold">
                  {stationData.fetch_summary?.end_time ? 
                    new Date(stationData.fetch_summary.end_time).toLocaleString('en-US', { 
                      timeZone: 'UTC',
                      month: '2-digit',
                      day: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit'
                    }).replace(/[\/,]/g, '').replace(' ', '') + 'Z' :
                    'UNKNOWN'
                  }
                </div>
              </div>
              
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-mono font-bold rounded hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  REFRESH
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full px-6 py-6">
        {/* Station Status Bar */}
        <div className="bg-gray-100 border-2 border-gray-400 rounded p-4 mb-6">
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

        {/* Raw Data Display - Professional Terminal Style */}
        <div className="space-y-4">
          {availableData.map(dataType => {
            const data = getRawData(stationData.alpha_data[dataType]);
            if (!data) return null;

            const isError = !!data.error;
            const displayText = data.error || data.raw || 'NO DATA';
            const obsTime = dataType === 'metar' ? extractObsTime(displayText) : null;
            const validTime = dataType === 'taf' ? extractValidTime(displayText) : null;

            return (
              <div key={dataType} className="border-2 border-gray-400 rounded">
                {/* Header */}
                <div className="bg-gray-200 px-4 py-3 border-b-2 border-gray-400 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="font-mono font-bold text-lg text-gray-900">
                      {dataType.toUpperCase()}
                    </h3>
                    {obsTime && (
                      <span className="font-mono text-sm text-gray-700">
                        OBS: {obsTime}
                      </span>
                    )}
                    {validTime && (
                      <span className="font-mono text-sm text-gray-700">
                        VALID: {validTime}
                      </span>
                    )}
                    {isError && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-mono text-xs font-bold">
                        ERROR
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(displayText, dataType)}
                    className="flex items-center gap-2 px-3 py-1 border-2 border-gray-400 rounded font-mono text-sm font-bold hover:bg-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedField === dataType ? 'COPIED!' : 'COPY'}
                  </button>
                </div>
                
                {/* Data Content */}
                <div className="p-4">
                  {isError ? (
                    <div className="font-mono text-sm text-red-600 bg-red-50 p-4 rounded border border-red-200">
                      {displayText}
                    </div>
                  ) : (
                    <div className="font-mono text-sm leading-relaxed bg-black text-green-400 p-4 rounded border-2 border-gray-600 whitespace-pre-line">
                      {displayText}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* No Data Message */}
          {availableData.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-mono text-xl font-bold text-gray-700 mb-2">NO WEATHER DATA AVAILABLE</h3>
              <p className="font-mono text-gray-500">
                NO ALPHANUMERIC DATA FOUND FOR STATION {selectedStation}
              </p>
              <div className="mt-4 font-mono text-sm text-gray-400">
                CHECK STATION CODE OR REFRESH DATA
              </div>
            </div>
          )}
        </div>

        {/* Footer - System Info */}
        <div className="mt-8 pt-6 border-t-2 border-gray-300">
          <div className="flex items-center justify-between font-mono text-xs text-gray-500">
            <div>
              CFPS WXRECALL DATA TERMINAL • STATION: {selectedStation} • 
              REGION: {stationData.gfa_region} ({regionNames[stationData.gfa_region] || 'UNKNOWN'})
            </div>
            <div>
              DATA FETCH: {stationData.fetch_summary?.end_time ? 
                new Date(stationData.fetch_summary.end_time).toISOString().replace('T', ' ').slice(0, 16) + 'Z' : 
                'UNKNOWN TIME'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalWeatherInterface;
