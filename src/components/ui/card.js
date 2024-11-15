// components/ui/card.js
import React from 'react';

export const Card = ({ children, className }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children }) => {
  return (
    <div className="border-b mb-2 pb-2">
      {children}
    </div>
  );
};

export const CardTitle = ({ children }) => {
  return (
    <h2 className="text-xl font-semibold" style={{ color: "white" }} >
      {children}
    </h2>
  );
};

export const CardContent = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  );
};
