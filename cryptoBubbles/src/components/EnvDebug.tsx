import React from 'react';

export const EnvDebug: React.FC = () => {
  const envVars = {
    // Instruments
    VITE_INSTRUMENTS_AIRTABLE_BASE_ID: import.meta.env.VITE_INSTRUMENTS_AIRTABLE_BASE_ID,
    VITE_INSTRUMENTS_AIRTABLE_API_KEY: import.meta.env.VITE_INSTRUMENTS_AIRTABLE_API_KEY,
    VITE_INSTRUMENTS_AIRTABLE_TABLE_ID: import.meta.env.VITE_INSTRUMENTS_AIRTABLE_TABLE_ID,
    
    // Price History
    VITE_PRICE_HISTORY_AIRTABLE_BASE_ID: import.meta.env.VITE_PRICE_HISTORY_AIRTABLE_BASE_ID,
    VITE_PRICE_HISTORY_AIRTABLE_API_KEY: import.meta.env.VITE_PRICE_HISTORY_AIRTABLE_API_KEY,
    VITE_PRICE_HISTORY_AIRTABLE_TABLE_ID: import.meta.env.VITE_PRICE_HISTORY_AIRTABLE_TABLE_ID,
  };

  return (
    <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 mt-4">
      <h4 className="text-sm font-medium text-gray-300 mb-3">Environment Variables Debug</h4>
      <div className="space-y-2 text-xs">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-400">{key}:</span>
            <span className={value ? 'text-green-400' : 'text-red-400'}>
              {value ? (key.includes('API_KEY') ? `${value.substring(0, 8)}...` : value) : 'undefined'}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        <div>NODE_ENV: {import.meta.env.NODE_ENV}</div>
        <div>MODE: {import.meta.env.MODE}</div>
        <div>All env keys: {Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')).join(', ')}</div>
      </div>
    </div>
  );
};