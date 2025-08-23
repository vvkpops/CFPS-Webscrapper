// src/components/results/AlphanumericResults.jsx
import React from 'react';
import { FileText } from 'lucide-react';
import {
  parseRawAlpha,
  parseUpperWind
} from '../../utils/parsers/alphaParsers.js';

// Try to extract ICAO/station from a raw block or from item fields
function extractStation(item, rawText) {
  // If item is object and contains station-like fields, prefer them
  if (item && typeof item === 'object') {
    if (item.icao) return item.icao;
    if (item.site) return item.site;
    if (item.station) return item.station;
    if (item.stationId) return item.stationId;
  }

  // Raw extraction: look for "A) XXXX" line or "A) XXXX B)" pattern
  if (typeof rawText === 'string') {
    const match = rawText.match(/A\)\s*([A-Z]{4})/);
    if (match) return match[1];
    // METAR/TAF style at start: e.g., "CYYT 081200Z ..." or "METAR CYYT ..."
    const m2 = rawText.match(/^\(?(?:[A-Z]{1,6}\s)?([A-Z]{4})\b/);
    if (m2) return m2[1];
  }
  return '';
}

// Generic renderer for raw products (METAR, TAF, NOTAM, SIGMET, AIRMET, PIREP)
function RawBoxRenderer(items, label = 'RAW') {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-4 text-sm text-gray-600">
        No {label} data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const displayText = parseRawAlpha(item) || '';
        const station = extractStation(item, displayText);
        return (
          <div key={idx} className="grid grid-cols-[84px_1fr] gap-0 bg-white border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 border-r flex flex-col justify-center items-start py-3 px-3 text-xs font-mono min-h-full">
              <div className="font-bold"> {label} </div>
              <div className="mt-1">{station}</div>
            </div>
            <div className="p-3">
              <pre
                className="font-mono text-sm whitespace-pre-wrap"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {displayText || 'No raw data available.'}
              </pre>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Upper wind text formatter to approximate the screenshot layout
function formatUpperWindText(parsed) {
  if (!parsed || parsed.error) return parsed.error || 'Malformed upperwind data';
  if (!Array.isArray(parsed.levels) || parsed.levels.length === 0) return 'No upper wind levels';

  // Group levels by altitude ordering
  const altitudes = Array.from(new Set(parsed.levels.map(l => l.altitude_ft))).sort((a, b) => a - b);
  const altHeaderParts = altitudes.map(a => String(a).padStart(5, ' '));
  const altHeader = altHeaderParts.join(' | ');

  // produce one line of values per record (we'll just produce a single line combining dir/spd/temp)
  const values = altitudes.map(alt => {
    const lvl = parsed.levels.find(l => l.altitude_ft === alt) || {};
    const dir = (lvl.wind_dir !== undefined && lvl.wind_dir !== null) ? String(lvl.wind_dir).padStart(3, ' ') : '  -';
    const spd = (lvl.wind_spd !== undefined && lvl.wind_spd !== null) ? String(lvl.wind_spd).padStart(3, ' ') : '  -';
    const tmp = (lvl.temp_c !== undefined && lvl.temp_c !== null) ? `${lvl.temp_c >= 0 ? '+' : ''}${lvl.temp_c}` : '  -';
    return `${dir} ${spd} ${tmp}`;
  }).join(' | ');

  // Compose header with validity if available
  let header = 'UPPER WIND';
  if (parsed.frameStart) {
    // try to format as YYYYMMDDHH but keep simple
    header = `VALID ${String(parsed.frameStart).replace(/[^0-9]/g, '').slice(0,6)}Z FOR USE ${parsed.usePeriod || ''}`;
  }
  return `${header}\n${altHeader}\n${(parsed.site || parsed.zone || '').padEnd(6)} ${values}`;
}

const tableRenderers = {
  // Render raw boxed blocks for these types
  metar: items => RawBoxRenderer(items, 'METAR'),
  taf: items => RawBoxRenderer(items, 'TAF'),
  notam: items => RawBoxRenderer(items, 'NOTAM'),
  sigmet: items => RawBoxRenderer(items, 'SIGMET'),
  airmet: items => RawBoxRenderer(items, 'AIRMET'),
  pirep: items => RawBoxRenderer(items, 'PIREP'),
  // Upperwind gets the formatted text block
  upperwind: items => {
    if (!Array.isArray(items) || items.length === 0) {
      return <div className="bg-white border rounded-lg p-4 text-sm text-gray-600">No UPPERWIND data.</div>;
    }
    return (
      <div className="space-y-3">
        {items.map((item, idx) => {
          const parsed = parseUpperWind(item);
          const text = formatUpperWindText(parsed);
          return (
            <pre key={idx} className="font-mono text-sm bg-gray-100 border rounded p-3 whitespace-pre-wrap">
              {text}
            </pre>
          );
        })}
      </div>
    );
  }
};

const typeKeyMap = {
  metar: 'metar',
  taf: 'taf',
  notam: 'notam',
  sigmet: 'sigmet',
  airmet: 'airmet',
  pirep: 'pirep',
  upperwind: 'upperwind'
};

const AlphanumericResults = ({ alphaData = {}, activeSite = '' }) => {
  // alphaData is expected to be an object where keys are alpha types (metar, taf, notam, etc)
  // each value is an object returned by fetchIndividualAlpha (often { data: [...] } or error)
  if (!alphaData || Object.keys(alphaData).length === 0) {
    return <p className="text-gray-500">No alphanumeric data available.</p>;
  }

  return (
    <div className="space-y-4">
      {Object.entries(alphaData).map(([alphaType, payload]) => {
        const lowerType = alphaType.toLowerCase();
        // payload may be { error: ..., status: ... } or an API object
        if (!payload) return null;

        // Determine items array for this alphaType
        let items = [];
        // Common shapes: payload.data (array), payload (array), payload.items, payload.list
        if (Array.isArray(payload)) items = payload;
        else if (Array.isArray(payload.data)) items = payload.data;
        else if (Array.isArray(payload.items)) items = payload.items;
        else if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
          // sometimes API returns single object
          items = [payload.data];
        } else {
          // fallback: if payload itself looks like a single record, render it as single-item array
          if (payload && typeof payload === 'object' && (payload.raw || payload.text || payload.english || payload.metar || payload.taf)) {
            items = [payload];
          }
        }

        const label = lowerType.toUpperCase();

        return (
          <div key={alphaType} className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {label}
              {payload && payload.error && <span className="text-red-500 ml-2">❌</span>}
            </h4>

            {payload && payload.error ? (
              <div className="bg-red-50 border border-red-200 p-3 rounded text-red-700">
                Error: {payload.error}
              </div>
            ) : (typeKeyMap[lowerType] && tableRenderers[typeKeyMap[lowerType]]) ? (
              tableRenderers[typeKeyMap[lowerType]](items)
            ) : (
              // Generic fallback: show raw blocks
              RawBoxRenderer(items, label)
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AlphanumericResults;
