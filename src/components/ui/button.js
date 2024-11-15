// components/ui/button.js
import React from "react";
import "./button.css";

export const Button = ({ onClick, disabled, className, children }) => {
  return (
    <button className="custom-button"
      
      onClick={onClick}
      disabled={disabled}
      //className={`bg-blue-500 text-white rounded-lg px-4 py-2 transition hover:bg-blue-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};
