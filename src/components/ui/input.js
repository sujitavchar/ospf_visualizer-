// components/ui/input.js
import React from 'react';

export const Input = ({ value, onChange, placeholder, type = 'text', className, disabled }) => {
  return (
    <input 
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`inputGroup border rounded-lg p-2 ${className}`}
    />
  );
};
