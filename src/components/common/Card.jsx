// components/common/Card.jsx

import React from 'react';

const Card = ({ 
  children, 
  title, 
  icon: Icon, 
  className = '', 
  borderColor = 'gray-500',
  ...props 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg border-l-4 border-${borderColor} ${className}`} {...props}>
      {(title || Icon) && (
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            {Icon && <Icon className={`w-5 h-5 text-${borderColor.replace('-500', '-600')}`} />}
            {title && <h2 className="text-xl font-bold text-gray-800">{title}</h2>}
          </div>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
