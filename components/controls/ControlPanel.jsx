// components/controls/ControlPanel.jsx

import React from 'react';
import { Play, Square, RotateCcw, Activity, AlertTriangle } from 'lucide-react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';

const ControlPanel = ({ 
  isScrapingActive, 
  onFetch, 
  onStartContinuous, 
  onStopContinuous, 
  onClear, 
  onDebug, 
  onTest 
}) => {
  return (
    <Card title="Controls" icon={Activity} borderColor="orange-500" className="mb-6">
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onFetch}
          disabled={isScrapingActive}
          icon={Play}
        >
          Fetch Weather Data
        </Button>
        
        <Button
          onClick={onStartContinuous}
          disabled={isScrapingActive}
          variant="success"
          icon={RotateCcw}
        >
          Start Continuous
        </Button>
        
        <Button
          onClick={onStopContinuous}
          disabled={!isScrapingActive}
          variant="danger"
          icon={Square}
        >
          Stop Scraping
        </Button>
        
        <Button
          onClick={onClear}
          variant="secondary"
          icon={AlertTriangle}
        >
          Clear Results
        </Button>
        
        <Button
          onClick={onDebug}
          variant="orange"
        >
          🔍 Debug GFA API
        </Button>
        
        <Button
          onClick={onTest}
          variant="purple"
        >
          🧪 Test Individual
        </Button>
      </div>
    </Card>
  );
};

export default ControlPanel;
