// components/dataSelection/DataSelectionPanel.jsx

import React from 'react';
import { FileText, Image as ImageIcon } from 'lucide-react';
import Card from '../common/Card.jsx';
import SelectionControls from './SelectionControls.jsx';
import { alphaOptions, imageCategories } from '../../utils/constants/dataTypes.js';

const DataSelectionPanel = ({ selectedData, onDataChange }) => {
  const toggleSelection = (category, value) => {
    const current = selectedData[category] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onDataChange({ ...selectedData, [category]: updated });
  };

  const selectAll = (category, subcategory = null) => {
    if (category === 'alpha') {
      onDataChange({ ...selectedData, alpha: alphaOptions.map(opt => opt.value) });
    } else if (category === 'image') {
      if (subcategory) {
        const current = selectedData.image || [];
        const categoryValues = imageCategories[subcategory].map(opt => opt.value);
        const filtered = current.filter(v => !categoryValues.includes(v));
        onDataChange({ ...selectedData, image: [...filtered, ...categoryValues] });
      } else {
        const allImageValues = Object.values(imageCategories).flat().map(opt => opt.value);
        onDataChange({ ...selectedData, image: allImageValues });
      }
    }
  };

  const deselectAll = (category, subcategory = null) => {
    if (category === 'alpha') {
      onDataChange({ ...selectedData, alpha: [] });
    } else if (category === 'image') {
      if (subcategory) {
        const current = selectedData.image || [];
        const categoryValues = imageCategories[subcategory].map(opt => opt.value);
        onDataChange({ ...selectedData, image: current.filter(v => !categoryValues.includes(v)) });
      } else {
        onDataChange({ ...selectedData, image: [] });
      }
    }
  };

  const selectEssentials = (category) => {
    if (category === 'alpha') {
      const essentials = alphaOptions.filter(opt => opt.essential).map(opt => opt.value);
      onDataChange({ ...selectedData, alpha: essentials });
    } else if (category === 'image') {
      const essentials = Object.values(imageCategories).flat().filter(opt => opt.essential).map(opt => opt.value);
      onDataChange({ ...selectedData, image: essentials });
    }
  };

  return (
    <div className="space-y-6">
      {/* Alphanumeric Data */}
      <Card title="Alphanumeric Data" icon={FileText} borderColor="green-500">
        <SelectionControls 
          category="alpha" 
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onSelectEssentials={selectEssentials}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {alphaOptions.map(option => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={(selectedData.alpha || []).includes(option.value)}
                onChange={() => toggleSelection('alpha', option.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`text-sm ${option.essential ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
                {option.label}
                {option.essential && <span className="text-yellow-500 ml-1">⭐</span>}
              </span>
            </label>
          ))}
        </div>
      </Card>

      {/* Image Data */}
      <Card title="Weather Imagery" icon={ImageIcon} borderColor="purple-500">
        <SelectionControls 
          category="image" 
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onSelectEssentials={selectEssentials}
        />

        <div className="space-y-6">
          {Object.entries(imageCategories).map(([categoryKey, options]) => (
            <div key={categoryKey}>
              <h3 className="text-lg font-semibold text-gray-700 mb-2 capitalize">{categoryKey} Products</h3>
              
              <SelectionControls 
                category="image" 
                subcategory={categoryKey}
                onSelectAll={selectAll}
                onDeselectAll={deselectAll}
                onSelectEssentials={selectEssentials}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {options.map(option => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={(selectedData.image || []).includes(option.value)}
                      onChange={() => toggleSelection('image', option.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`text-sm ${option.essential ? 'font-medium text-purple-700' : 'text-gray-700'}`}>
                      {option.label}
                      {option.essential && <span className="text-yellow-500 ml-1">⭐</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DataSelectionPanel;
