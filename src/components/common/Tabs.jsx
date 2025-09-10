// components/common/Tabs.jsx

import React, { useState } from 'react';

const Tabs = ({ children, defaultTab = null, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || (children[0]?.key || children[0]?.props?.value));

  const tabElements = React.Children.toArray(children);

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 border-b mb-6">
        {tabElements.map((child) => {
          const tabKey = child.key || child.props.value;
          const isActive = activeTab === tabKey;
          
          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                isActive
                  ? (child.props.activeColor || 'bg-blue-600 text-white border-b-2 border-blue-600')
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {child.props.icon && <child.props.icon className="w-4 h-4 inline mr-2" />}
              {child.props.label}
              {child.props.count && ` (${child.props.count})`}
            </button>
          );
        })}
      </div>

      <div className="min-h-96">
        {tabElements.find(child => (child.key || child.props.value) === activeTab)}
      </div>
    </div>
  );
};

const TabPanel = ({ children, value, label, icon, activeColor, count }) => {
  return <div>{children}</div>;
};

Tabs.Panel = TabPanel;

export default Tabs;
