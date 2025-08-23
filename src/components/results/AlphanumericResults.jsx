import React from 'react';
import { FileText } from 'lucide-react';
import {
  parseNOTAM,
  parseSIGMET,
  parseAIRMET,
  parsePIREP,
  parseUpperWind
} from '../../utils/parsers/alphaParsers.js';

const tableRenderers = {
  notam: (items) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded">
        <thead>
          <tr className="bg-blue-50">
            <th className="p-2 text-left">Number</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Classification</th>
            <th className="p-2 text-left">ICAO</th>
            <th className="p-2 text-left">Location</th>
            <th className="p-2 text-left">Valid From</th>
            <th className="p-2 text-left">Valid To</th>
            <th className="p-2 text-left">Q Line</th>
            <th className="p-2 text-left">Summary</th>
            <th className="p-2 text-left">Body</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const parsed = parseNOTAM(item);
            return (
              <tr key={idx} className="border-t align-top">
                <td className="p-2 font-mono text-xs">{parsed.number}</td>
                <td className="p-2">{parsed.type}</td>
                <td className="p-2">{parsed.classification}</td>
                <td className="p-2">{parsed.icao}</td>
                <td className="p-2">{parsed.location}</td>
                <td className="p-2 text-xs">{parsed.validFrom}</td>
                <td className="p-2 text-xs">{parsed.validTo}</td>
                <td className="p-2 text-xs">{parsed.qLine}</td>
                <td className="p-2 text-xs whitespace-pre-line">{parsed.summary}</td>
                <td className="p-2 text-xs whitespace-pre-line">{parsed.body}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ),
  sigmet: (items) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded">
        <thead>
          <tr className="bg-purple-50">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Region</th>
            <th className="p-2 text-left">Validity</th>
            <th className="p-2 text-left">Phenomenon</th>
            <th className="p-2 text-left">Text</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const parsed = parseSIGMET(item);
            return (
              <tr key={idx} className="border-t">
                <td className="p-2">{parsed.id}</td>
                <td className="p-2">{parsed.region}</td>
                <td className="p-2">{parsed.validity}</td>
                <td className="p-2">{parsed.phenomenon}</td>
                <td className="p-2 text-xs">{parsed.text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ),
  airmet: (items) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded">
        <thead>
          <tr className="bg-green-50">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Region</th>
            <th className="p-2 text-left">Validity</th>
            <th className="p-2 text-left">Phenomenon</th>
            <th className="p-2 text-left">Text</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const parsed = parseAIRMET(item);
            return (
              <tr key={idx} className="border-t">
                <td className="p-2">{parsed.id}</td>
                <td className="p-2">{parsed.region}</td>
                <td className="p-2">{parsed.validity}</td>
                <td className="p-2">{parsed.phenomenon}</td>
                <td className="p-2 text-xs">{parsed.text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ),
  pirep: (items) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded">
        <thead>
          <tr className="bg-yellow-50">
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Location</th>
            <th className="p-2 text-left">Time</th>
            <th className="p-2 text-left">Details</th>
            <th className="p-2 text-left">Text</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const parsed = parsePIREP(item);
            return (
              <tr key={idx} className="border-t">
                <td className="p-2">{parsed.type}</td>
                <td className="p-2">{parsed.location}</td>
                <td className="p-2">{parsed.time}</td>
                <td className="p-2">{parsed.details}</td>
                <td className="p-2 text-xs">{parsed.text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ),
  upperwind: (items) => (
    <div className="space-y-8">
      {items.map((item, idx) => {
        const parsed = parseUpperWind(item);
        if (parsed.error) {
          return <pre key={idx} className="bg-red-100 p-2 text-sm">{parsed.error}</pre>;
        }
        return (
          <div key={idx} className="bg-white border rounded-lg p-4">
            <div className="mb-2 font-mono text-xs text-gray-700">
              <b>Item {idx+1}</b> | <b>ID:</b> {parsed.id} | <b>Zone:</b> {parsed.zone} | <b>Source:</b> {parsed.source}<br/>
              <b>Frame Start:</b> {parsed.frameStart} | <b>Frame End:</b> {parsed.frameEnd}
            </div>
            <div className="mb-2 text-xs text-gray-600">
              <b>Issued:</b> {parsed.issueTime} | <b>Valid:</b> {parsed.validStart} - {parsed.validEnd}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-50 border rounded">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="p-2 text-left">Altitude (ft)</th>
                    <th className="p-2 text-left">Wind Dir (°)</th>
                    <th className="p-2 text-left">Wind Spd (kt)</th>
                    <th className="p-2 text-left">Temp (°C)</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.levels.map((lvl, lidx) => (
                    <tr key={lidx} className="border-t">
                      <td className="p-2">{lvl.altitude_ft}</td>
                      <td className="p-2">{lvl.wind_dir}</td>
                      <td className="p-2">{lvl.wind_spd}</td>
                      <td className="p-2">{lvl.temp_c !== null && lvl.temp_c !== undefined ? lvl.temp_c : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  ),
};

const typeKeyMap = {
  notam: 'notam',
  sigmet: 'sigmet',
  airmet: 'airmet',
  pirep: 'pirep',
  upperwind: 'upperwind',
};

const AlphanumericResults = ({ alphaData, activeSite }) => {
  if (!alphaData || Object.keys(alphaData).length === 0) {
    return <p className="text-gray-500">No alphanumeric data available.</p>;
  }

  return (
    <div className="space-y-4">
      {Object.entries(alphaData).map(([alphaType, data]) => (
        <div key={alphaType} className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {alphaType.toUpperCase()}
            {data.error && <span className="text-red-500">❌</span>}
          </h4>
          {data.error ? (
            <div className="bg-red-50 border border-red-200 p-3 rounded text-red-700">
              Error: {data.error}
            </div>
          ) : data.data && Array.isArray(data.data) ? (
            (typeKeyMap[alphaType.toLowerCase()] && tableRenderers[typeKeyMap[alphaType.toLowerCase()]])
              ? tableRenderers[typeKeyMap[alphaType.toLowerCase()]](data.data)
              : (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 bg-white p-2 rounded">
                    <strong>Data Items:</strong> {data.data.length} | <strong>Site:</strong> {activeSite}
                  </div>
                  {data.data.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded border">
                      <div className="flex justify-between items-center mb-2 text-xs text-gray-500">
                        <span>Item {index + 1} | ID: {item.pk || 'N/A'}</span>
                        <span>{item.startValidity || 'No timestamp'}</span>
                      </div>
                      {item.text && (
                        <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                          {item.text}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )
          ) : (
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
};

export default AlphanumericResults;
