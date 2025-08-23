import React from 'react';
import { FileText } from 'lucide-react';
import { parseUpperWind, parseSIGMET, parseAIRMET, parsePIREP } from '../../utils/parsers/alphaParsers.js';

function getICAOFromRaw(raw) {
  // Try to extract ICAO from the raw NOTAM (A) line)
  const match = raw.match(/A\)\s*([A-Z]{4})/);
  return match ? match[1] : '';
}

const tableRenderers = {
  notam: (items) => (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const rawText = item.raw || item.text || '';
        const icao = getICAOFromRaw(rawText);
        return (
          <div key={idx} className="grid grid-cols-[100px_1fr] gap-0 bg-white border rounded-lg overflow-hidden shadow-sm">
            {/* Left column */}
            <div className="bg-gray-50 border-r flex flex-col justify-center items-start py-4 px-3 text-xs font-mono min-h-full">
              <div className="font-bold">NOTAM</div>
              <div>{icao}</div>
            </div>
            {/* Right column: raw NOTAM text */}
            <div className="p-4">
              <pre className="font-mono text-xs whitespace-pre-line">{rawText}</pre>
            </div>
          </div>
        );
      })}
    </div>
  ),
  upperwind: (items) => (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const parsed = parseUpperWind(item);
        // Compose display using previous formatUpperWindText helper if needed
        // (your upperwind display already matches what you want)
        return (
          <pre 
            key={idx}
            className="font-mono text-xs bg-gray-100 border rounded p-4 whitespace-pre mb-2"
            style={{overflowX:'auto'}}
          >
            {/* Could use formatUpperWindText(parsed) here */}
            {item.text || JSON.stringify(parsed, null, 2)}
          </pre>
        );
      })}
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
