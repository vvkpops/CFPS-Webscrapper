// components/debug/APIDebugPanel.jsx

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Loader } from 'lucide-react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';
import { testAPIConnectivity } from '../../services/api/weatherApi.js';

const APIDebugPanel = () => {
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [manualTestUrl, setManualTestUrl] = useState('');
  const [manualTestResult, setManualTestResult] = useState('');

  const handleAPITest = async () => {
    setIsTestingAPI(true);
    try {
      const results = await testAPIConnectivity();
      setTestResults(results);
    } catch (error) {
      setTestResults({ error: error.message });
    } finally {
      setIsTestingAPI(false);
    }
  };

  const testManualUrl = async () => {
    if (!manualTestUrl.trim()) return;
    
    try {
      setManualTestResult('Testing...');
      const response = await fetch(manualTestUrl);
      const text = await response.text();
      setManualTestResult(`Status: ${response.status}\nResponse: ${text.substring(0, 500)}...`);
    } catch (error) {
      setManualTestResult(`Error: ${error.message}`);
    }
  };

  const renderTestResults = () => {
    if (!testResults) return null;

    if (testResults.error) {
      return (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <div className="text-red-700">Test Error: {testResults.error}</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* CORS Proxy Results */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            🌐 CORS Proxy Test Results
          </h4>
          <div className="space-y-2">
            {testResults.corsProxies.map((proxy, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded ${
                proxy.working ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <span className="font-mono text-sm">{proxy.proxy}</span>
                <div className="flex items-center gap-2">
                  {proxy.working ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    {proxy.working ? `Status: ${proxy.status}` : proxy.error}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Endpoint Results */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            🛜 API Endpoint Test Results
          </h4>
          <div className="space-y-2">
            {testResults.apiEndpoints.map((endpoint, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded ${
                endpoint.accessible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <span className="font-mono text-sm">{endpoint.endpoint}</span>
                <div className="flex items-center gap-2">
                  {endpoint.accessible ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    {endpoint.accessible ? `Status: ${endpoint.status}` : endpoint.error}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            💡 Recommendations
          </h4>
          <div className="space-y-2">
            {testResults.recommendations.map((recommendation, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 p-3 rounded">
                <span className="text-sm text-blue-700">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card title="🔧 API Debug & Connectivity Test" icon={AlertTriangle} borderColor="orange-500" className="mb-6">
      <div className="space-y-6">
        {/* Current Issues */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <h4 className="font-semibold text-yellow-800 mb-2">🚨 Current Issues Detected</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• All API requests returning HTTP 404 errors</li>
            <li>• CORS proxy may not be working correctly</li>
            <li>• Nav Canada API endpoints may have changed</li>
            <li>• API may require authentication or different headers</li>
          </ul>
        </div>

        {/* Test Controls */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleAPITest}
            disabled={isTestingAPI}
            variant="orange"
            icon={isTestingAPI ? Loader : AlertTriangle}
          >
            {isTestingAPI ? 'Testing API Connectivity...' : 'Test API Connectivity'}
          </Button>
        </div>

        {/* Test Results */}
        {isTestingAPI && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded">
            <div className="flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-blue-700">Testing CORS proxies and API endpoints...</span>
            </div>
          </div>
        )}

        {renderTestResults()}

        {/* Manual URL Test */}
        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-800 mb-3">🧪 Manual URL Test</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test URL (with CORS proxy):
              </label>
              <input
                type="text"
                value={manualTestUrl}
                onChange={(e) => setManualTestUrl(e.target.value)}
                placeholder="https://corsproxy.io/?https%3A%2F%2Fexample.com%2Fapi"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button onClick={testManualUrl} size="sm">
              Test URL
            </Button>
            {manualTestResult && (
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                {manualTestResult}
              </pre>
            )}
          </div>
        </div>

        {/* Suggested Fixes */}
        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-800 mb-3">🔧 Suggested Fixes</h4>
          <div className="space-y-3 text-sm">
            <div className="bg-green-50 border border-green-200 p-3 rounded">
              <strong>Option 1:</strong> Use a different CORS proxy service (cors-anywhere, allorigins)
            </div>
            <div className="bg-green-50 border border-green-200 p-3 rounded">
              <strong>Option 2:</strong> Set up your own CORS proxy server
            </div>
            <div className="bg-green-50 border border-green-200 p-3 rounded">
              <strong>Option 3:</strong> Contact Nav Canada to confirm current API endpoints
            </div>
            <div className="bg-green-50 border border-green-200 p-3 rounded">
              <strong>Option 4:</strong> Run the application from a server with CORS headers configured
            </div>
          </div>
        </div>

        {/* Working Example URLs */}
        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-800 mb-3">📋 Test These URLs Manually</h4>
          <div className="space-y-2 text-xs">
            <div className="bg-gray-100 p-2 rounded font-mono">
              https://plan.navcanada.ca/weather/api/alpha/?site=CYUL&alpha=metar
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              https://corsproxy.io/?https%3A%2F%2Fplan.navcanada.ca%2Fweather%2Fapi%2Falpha%2F%3Fsite%3DCYUL%26alpha%3Dmetar
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Try opening these URLs directly in your browser to see if they return data or 404 errors.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default APIDebugPanel;
