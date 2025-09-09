// components/results/EnhancedAlphanumericResults.jsx

import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronRight, Copy, Eye, EyeOff } from 'lucide-react';
import Button from '../common/Button.jsx';
import { parseRawAlpha, parseUpperWind } from '../../utils/parsers/alphaParsers.js';

// Try to extract ICAO/station from a raw block or from item fields
function extractStation(item, rawText) {
  if (item && typeof item === 'object') {
    if (item.icao) return item.icao;
    if (item.site) return item.site;
    if (item.station) return item.station;
    if (item.stationId) return item.stationId;
    if (item.A && typeof item.A === 'string') return item.A;
  }

  if (typeof rawText === 'string') {
    const match = rawText.match(/A\)\s*([A-Z]{4})/);
    if (match) return match[1];
    const m2 = rawText.match(/^\(?(?:[A-Z]{1,6}\s)?([A-Z]{4})\b/);
    if (m2) return m2[1];
  }
  return '';
}

// Enhanced data card component
const DataCard = ({ title, station, data, type, isExpanded, onToggle, index }) => {
  const [showRaw, setShowRaw] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(data);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      metar: 'bg-blue-50 border-blue-200 text-blue-800',
      taf: 'bg-green-50 border-green-200 text-green-800',
      notam: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      sigmet: 'bg-red-50 border-red-200 text-red-800',
      airmet: 'bg-orange-50 border-orange-200 text-orange-800',
      pirep: 'bg-purple-50 border-purple-200 text-purple-800',
      upperwind: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    };
    return colors[type.toLowerCase()] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const getTypeIcon = (type) => {
    const icons = {
      metar: '🌡️',
      taf: '📋',
      notam: '⚠️',
      sigmet: '⚡',
      airmet: '🌪️',
      pirep: '✈️',
      upperwind: '💨'
    };
    return icons[type.toLowerCase()] || '📄';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div 
        className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${getTypeColor(type)}`}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <span className="text-2xl">{getTypeIcon(type)}</span>
            </div>
            <div>
              <h4 className="font-semibold text-lg">{title}</h4>
              {station && (
                <p className="text-sm opacity-75 font-mono">{station}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-white bg-opacity-50 rounded-full text-xs font-medium">
              #{index + 1}
            </span>
            {isExpanded && (
              <div className="flex items-center gap-1">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRaw(!showRaw);
                  }}
                  size="xs"
                  variant="secondary"
                  icon={showRaw ? EyeOff : Eye}
                />
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard();
                  }}
                  size="xs"
                  variant="secondary"
                  icon={Copy}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 border-t bg-gray-50">
          {showRaw ? (
            <pre className="font-mono text-sm bg-gray-900 text-green-400 p-4 rounded overflow-x-auto whitespace-pre-wrap">
              {data}
            </pre>
          ) : (
            <div className="bg-white rounded border p-4">
              <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
                {data}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Upper wind formatter component
const UpperWindCard = ({ items, isExpanded, onToggle, index }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <DataCard
        title="UPPERWIND"
        station=""
        data="No UPPERWIND data available."
        type="upperwind"
        isExpanded={isExpanded}
        onToggle={onToggle}
        index={index}
      />
    );
  }

  const formatUpperWindText = (parsed) => {
    if (!parsed || parsed.error) return parsed?.error || 'Malformed upperwind data';
    if (!Array.isArray(parsed.levels) || parsed.levels.length === 0) return 'No upper wind levels';

    const altitudes = Array.from(new Set(parsed.levels.map(l => l.altitude_ft))).sort((a, b) => a - b);
    const altHeaderParts = altitudes.map(a => String(a).padStart(5, ' '));
    const altHeader = altHeaderParts.join(' | ');

    const values = altitudes.map(alt => {
      const lvl = parsed.levels.find(l => l.altitude_ft === alt) || {};
      const dir = (lvl.wind_dir !== undefined && lvl.wind_dir !== null) ? String(lvl.wind_dir).padStart(3, ' ') : '  -';
      const spd = (lvl.wind_spd !== undefined && lvl.wind_spd !== null) ? String(lvl.wind_spd).padStart(3, ' ') : '  -';
      const tmp = (lvl.temp_c !== undefined && lvl.temp_c !== null) ? `${lvl.temp_c >= 0 ? '+' : ''}${lvl.temp_c}` : '  -';
      return `${dir} ${spd} ${tmp}`;
    }).join(' | ');

    let header = 'UPPER WIND';
    if (parsed.frameStart) {
      const dt = String(parsed.frameStart).replace(/[^0-9]/g, '').slice(0,6);
      header = `VALID ${dt}Z FOR USE ${parsed.usePeriod || ''}`;
    }
    return `${header}\n${altHeader}\n${(parsed.site || parsed.zone || '').padEnd(6)} ${values}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div 
        className="p-4 border-l-4 bg-indigo-50 border-indigo-200 text-indigo-800 cursor-pointer hover:bg-indigo-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <span className="text-2xl">💨</span>
            </div>
            <div>
              <h4 className="font-semibold text-lg">UPPER WINDS</h4>
              <p className="text-sm opacity-75">{items.length} forecast{items.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-white bg-opacity-50 rounded-full text-xs font-medium">
            #{index + 1}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t bg-gray-50 space-y-3">
          {items.map((item, idx) => {
            const parsed = parseUpperWind(item);
            const text = formatUpperWindText(parsed);
            
            return (
              <div key={idx} className="bg-white rounded border p-4">
                <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
                  {text}
                </pre>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const EnhancedAlphanumericResults = ({ alphaData = {}, activeSite = '' }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [expandAll, setExpandAll] = useState(false);

  const toggleExpanded = (key) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedItems(new Set());
    } else {
      setExpandedItems(new Set(Object.keys(alphaData)));
    }
    setExpandAll(!expandAll);
  };

  if (!alphaData || Object.keys(alphaData).length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 text-lg">No alphanumeric data available</p>
        <p className="text-gray-400 text-sm">Run a fetch operation to see weather reports</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Weather Reports for {activeSite}
        </h3>
        <Button
          onClick={toggleExpandAll}
          variant="secondary"
          size="sm"
          icon={expandAll ? EyeOff : Eye}
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </Button>
      </div>

      {/* Data Cards */}
      <div className="space-y-4">
        {Object.entries(alphaData).map(([alphaType, payload], index) => {
          const lowerType = alphaType.toLowerCase();
          const isExpanded = expandedItems.has(alphaType);
          
          if (!payload) return null;

          // Handle errors
          if (payload && payload.error) {
            return (
              <div key={alphaType} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-500">❌</span>
                  <h4 className="font-semibold text-red-800">{alphaType.toUpperCase()}</h4>
                </div>
                <p className="text-red-700">Error: {payload.error}</p>
              </div>
            );
          }

          // Normalize to items array
          let items = [];
          if (Array.isArray(payload)) {
            items = payload;
          } else if (Array.isArray(payload.data)) {
            items = payload.data;
          } else if (payload && typeof payload === 'object') {
            const allValues = Object.values(payload);
            const looksLikeMapOfRecords = allValues.length > 1 && allValues.every(v => v && (v.raw || v.text || typeof v === 'string' || (v.data && (Array.isArray(v.data) || typeof v.data === 'object'))));
            if (looksLikeMapOfRecords) {
              items = allValues;
            } else if (payload.data && typeof payload.data === 'object') {
              items = [payload.data];
            } else if (payload.raw || payload.text || payload.english || payload.metar || payload.taf) {
              items = [payload];
            } else {
              const arrayField = Object.keys(payload).find(k => Array.isArray(payload[k]));
              if (arrayField) items = payload[arrayField];
              else items = [payload];
            }
          } else {
            items = [payload];
          }

          // Special handling for upper winds
          if (lowerType === 'upperwind') {
            return (
              <UpperWindCard
                key={alphaType}
                items={items}
                isExpanded={isExpanded}
                onToggle={() => toggleExpanded(alphaType)}
                index={index}
              />
            );
          }

          // Regular data cards
          return (
            <div key={alphaType} className="space-y-2">
              {items.map((item, itemIndex) => {
                const displayText = parseRawAlpha(item) || '';
                const station = extractStation(item, displayText);
                const uniqueKey = `${alphaType}-${itemIndex}`;
                
                return (
                  <DataCard
                    key={uniqueKey}
                    title={alphaType.toUpperCase()}
                    station={station}
                    data={displayText}
                    type={lowerType}
                    isExpanded={expandedItems.has(uniqueKey)}
                    onToggle={() => toggleExpanded(uniqueKey)}
                    index={itemIndex}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedAlphanumericResults;
