// components/export/ExportPanel.jsx

import React from 'react';
import { Download } from 'lucide-react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';

const ExportPanel = ({ onExportJSON, onExportCSV, onExportHTML, hasData }) => {
  if (!hasData) return null;

  return (
    <Card title="💾 Export Data" icon={Download} borderColor="green-500" className="mb-6">
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onExportJSON}
          variant="success"
          icon={Download}
        >
          Export JSON
        </Button>
        <Button
          onClick={onExportCSV}
          variant="success"
          icon={Download}
        >
          Export CSV
        </Button>
        <Button
          onClick={onExportHTML}
          variant="success"
          icon={Download}
        >
          Export HTML
        </Button>
      </div>
    </Card>
  );
};

export default ExportPanel;
