// src/components/controls/ControlBar.jsx
import React, { useState } from 'react';
import { 
  Play, Square, RefreshCw, Trash2, Download, 
  Grid, List, Layers 
} from 'lucide-react';

const ControlBar = ({ 
  isLoading, 
  isScrapingActive, 
  onFetch, 
  onStartContinuous, 
  onStopContinuous, 
  onClear, 
  onExport, 
  hasData,
  viewMode,
  setViewMode 
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onFetch}
            disabled={isLoading || isScrapingActive}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Fetch Data
              </>
            )}
          </button>

          {!isScrapingActive ? (
            <button
              onClick={onStartContinuous}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Auto Update
            </button>
          ) : (
            <button
              onClick={onStopContinuous}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          )}

          {hasData && (
            <button
              onClick={onClear}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center gap-4">
          {/* View Mode Selector */}
          {hasData && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('unified')}
                className={`p-2 rounded ${viewMode === 'unified' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''} transition-all`}
                title="Unified View"
              >
                <Layers className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''} transition-all`}
                title="Grid View"
              >
                <Grid className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''} transition-all`}
                title="List View"
              >
                <List className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          )}

          {/* Export Menu */}
          {hasData && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                  <button
                    onClick={() => {
                      onExport('json');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Export as JSON
                  </button>
                  <button
                    onClick={() => {
                      onExport('csv');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => {
                      onExport('html');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Export as HTML
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlBar;