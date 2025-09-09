// components/dataSelection/SelectionControls.jsx

import React from 'react';
import Button from '../common/Button.jsx';

const SelectionControls = ({ category, subcategory = null, onSelectAll, onDeselectAll, onSelectEssentials }) => (
  <div className="flex flex-wrap gap-2 mb-3 p-2 bg-blue-50 rounded">
    <Button
      onClick={() => onSelectAll(category, subcategory)}
      size="xs"
      className="text-xs"
    >
      ✅ Select All
    </Button>
    <Button
      onClick={() => onDeselectAll(category, subcategory)}
      variant="danger"
      size="xs"
      className="text-xs"
    >
      ❌ Deselect All
    </Button>
    {!subcategory && (
      <Button
        onClick={() => onSelectEssentials(category)}
        variant="warning"
        size="xs"
        className="text-xs"
      >
        ⭐ Essentials
      </Button>
    )}
  </div>
);

export default SelectionControls;
