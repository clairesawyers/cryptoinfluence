import React, { useState } from 'react';

export const QueryDebugTool = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [envVars, setEnvVars] = useState({
    baseId: '',
    apiKey: '',
    tableId: ''
  });

  // Manual env var input for artifact environment
  const handleEnvChange = (field: string, value: string) => {
    setEnvVars(prev => ({ ...prev, [field]: value }));
  };

  const testExactQuery = async () => {
    if (!envVars.baseId || !envVars.apiKey || !envVars.tableId) {
      alert('Please fill in all environment variables first!');
      return;
    }

    setLoading(true);
    console.log('🔍 === TESTING EXACT AIRTABLE QUERY ===');
    
    try {
      const { baseId, apiKey, tableId } = envVars;
      const symbol = 'BTC';
      const date = '2025-05-15';
      
      console.log(`🔍 Testing query for ${symbol} on ${date}`);
      console.log(`📊 Base ID: ${baseId}`);
      console.log(`📊 Table ID: ${tableId}`);
      console.log(`📊 API Key: ${apiKey?.substring(0, 8)}...`);

      // Test 1: Basic table access
      console.log('\n🧪 TEST 1: Basic table access');
      const basicResponse = await fetch(
        `https://api.airtable.com/v0/${baseId}/${tableId}?maxRecords=3`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );
      
      console.log(`Basic query status: ${basicResponse.status}`);
      
      if (basicResponse.ok) {
        const basicData = await basicResponse.json();
        console.log(`✅ Basic access works: ${basicData.records.length} records`);
        
        if (basicData.records.length > 0) {
          console.log('Sample record:', basicData.records[0].fields);
          console.log('Available field names:', Object.keys(basicData.records[0].fields));
        }
      } else {
        console.log('❌ Basic access failed');
        const errorText = await basicResponse.text();
        console.log('Error:', errorText);
        setResults({ error: 'Basic table access failed', details: errorText });
        setLoading(false);
        return;
      }

      // Test 2: Symbol-only filter
      console.log('\n🧪 TEST 2: Symbol-only filter');
      const symbolOnlyFormula = `{Symbol} = '${symbol}'`;
      console.log(`Filter formula: ${symbolOnlyFormula}`);
      
      const symbolResponse = await fetch(
        `https://api.airtable.com/v0/${baseId}/${tableId}?` + 
        `filterByFormula=${encodeURIComponent(symbolOnlyFormula)}&` +
        `maxRecords=10&` +
        `sort[0][field]=Date&sort[0][direction]=desc`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );
      
      console.log(`Symbol query status: ${symbolResponse.status}`);
      
      if (symbolResponse.ok) {
        const symbolData = await symbolResponse.json();
        console.log(`✅ Symbol filter works: ${symbolData.records.length} ${symbol} records`);
        
        symbolData.records.forEach((record: any, index: number) => {
          console.log(`  ${index + 1}. ${record.fields.Date}: ${record.fields.Price}`);
        });
        
        // Check if our target date exists
        const targetRecord = symbolData.records.find((r: any) => r.fields.Date === date);
        if (targetRecord) {
          console.log(`✅ Found target date ${date}: ${targetRecord.fields.Price}`);
        } else {
          console.log(`❌ Target date ${date} not found in ${symbol} records`);
          console.log('Available dates:', symbolData.records.map((r: any) => r.fields.Date));
        }
      } else {
        console.log('❌ Symbol filter failed');
        const errorText = await symbolResponse.text();
        console.log('Error:', errorText);
      }

      // Test 3: Exact date and symbol filter
      console.log('\n🧪 TEST 3: Exact date + symbol filter');
      const exactFormula = `AND({Symbol} = '${symbol}', {Date} = '${date}')`;
      console.log(`Filter formula: ${exactFormula}`);
      console.log(`Encoded formula: ${encodeURIComponent(exactFormula)}`);
      
      const exactResponse = await fetch(
        `https://api.airtable.com/v0/${baseId}/${tableId}?` + 
        `filterByFormula=${encodeURIComponent(exactFormula)}&` +
        `maxRecords=1`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );
      
      console.log(`Exact query status: ${exactResponse.status}`);
      console.log(`Full URL: ${exactResponse.url}`);
      
      if (exactResponse.ok) {
        const exactData = await exactResponse.json();
        console.log(`Query result: ${exactData.records.length} records`);
        
        if (exactData.records.length > 0) {
          const record = exactData.records[0];
          console.log(`✅ FOUND: ${record.fields.Symbol} on ${record.fields.Date} = ${record.fields.Price}`);
          
          setResults({
            success: true,
            symbol: record.fields.Symbol,
            date: record.fields.Date,
            price: record.fields.Price,
            message: 'Query successful! Found the data.',
            fullRecord: record.fields
          });
        } else {
          console.log(`❌ No records found with exact filter`);
          setResults({
            success: false,
            message: 'Exact query returned no results - this is the problem!',
            formula: exactFormula,
            suggestion: 'The data exists but the query format is wrong'
          });
        }
      } else {
        console.log('❌ Exact query failed');
        const errorText = await exactResponse.text();
        console.log('Error:', errorText);
        
        setResults({
          success: false,
          message: `Query failed with status ${exactResponse.status}`,
          error: errorText
        });
      }

      // Test 4: Alternative date formats
      console.log('\n🧪 TEST 4: Testing alternative date formats');
      const dateFormats = [
        '2025-05-15',
        '05/15/2025',
        '5/15/2025',
        '2025-5-15'
      ];
      
      for (const testDate of dateFormats) {
        const altFormula = `AND({Symbol} = '${symbol}', {Date} = '${testDate}')`;
        
        const altResponse = await fetch(
          `https://api.airtable.com/v0/${baseId}/${tableId}?` + 
          `filterByFormula=${encodeURIComponent(altFormula)}&` +
          `maxRecords=1`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
          }
        );
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          if (altData.records.length > 0) {
            console.log(`✅ Date format '${testDate}' works! Found ${altData.records[0].fields.Price}`);
          } else {
            console.log(`❌ Date format '${testDate}' - no match`);
          }
        }
      }
      
    } catch (error: any) {
      console.error('❌ Test failed:', error);
      setResults({
        success: false,
        message: 'Test failed with error',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const quickTest = async () => {
    if (!envVars.baseId || !envVars.apiKey || !envVars.tableId) {
      alert('Please fill in environment variables first!');
      return;
    }

    console.log('🔍 === QUICK TEST ===');
    
    const { baseId, apiKey, tableId } = envVars;
    const formula = `AND({Symbol} = 'BTC', {Date} = '2025-05-15')`;
    console.log('Testing formula:', formula);
    
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableId}?` + 
      `filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`,
      {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      }
    );
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Records found:', data.records.length);
      if (data.records.length > 0) {
        console.log('✅ Found:', data.records[0].fields);
      } else {
        console.log('❌ No records found');
      }
    } else {
      console.log('❌ Query failed');
      const error = await response.text();
      console.log('Error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🔍 Query Debug Tool
        </h2>
        
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">⚙️ Environment Variables</h4>
          <p className="text-yellow-700 text-sm mb-3">
            Enter your Airtable credentials to test the queries:
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base ID</label>
              <input
                type="text"
                placeholder="appnpn5eiYhOp4Exx"
                value={envVars.baseId}
                onChange={(e) => handleEnvChange('baseId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="password"
                placeholder="pat9jgkS..."
                value={envVars.apiKey}
                onChange={(e) => handleEnvChange('apiKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Table ID</label>
              <input
                type="text"
                placeholder="tblXhhrCxFJiYmgqt"
                value={envVars.tableId}
                onChange={(e) => handleEnvChange('tableId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">📊 What We Know</h4>
          <p className="text-blue-700 text-sm">
            CSV shows BTC data exists for 2025-05-15 at $103,531.72. Let's debug why the query isn't finding it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={testExactQuery}
            disabled={loading || !envVars.baseId || !envVars.apiKey || !envVars.tableId}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : '🧪 Run Full Test'}
          </button>
          
          <button
            onClick={quickTest}
            disabled={loading || !envVars.baseId || !envVars.apiKey || !envVars.tableId}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : '⚡ Quick Test'}
          </button>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>📋 Open Console (F12) to see detailed test results!</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Basic table access test</li>
            <li>Symbol-only filter (should find BTC records)</li>
            <li>Exact date + symbol filter (this is likely failing)</li>
            <li>Alternative date formats test</li>
          </ol>
        </div>
      </div>

      {/* Results Display */}
      {results && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Test Results</h3>
          
          {results.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">✅ Success!</h4>
              <p className="text-green-700">
                Found: {results.symbol} on {results.date} = ${results.price}
              </p>
              <p className="text-sm text-green-600 mt-2">{results.message}</p>
            </div>
          ) : results.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">❌ Error</h4>
              <p className="text-red-700">{results.message || results.error}</p>
              {results.details && (
                <pre className="text-xs text-red-600 mt-2 overflow-auto">
                  {results.details}
                </pre>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Query Issue Found</h4>
              <p className="text-yellow-700">{results.message}</p>
              {results.formula && (
                <p className="text-sm text-yellow-600 font-mono mt-2">
                  Formula tested: {results.formula}
                </p>
              )}
              {results.suggestion && (
                <p className="text-sm text-yellow-600 mt-2">
                  💡 {results.suggestion}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p><strong>🎯 Expected Outcome:</strong></p>
        <p>
          The test should find BTC at $103,531.72 for 2025-05-15. If it doesn't, 
          we'll see exactly where the query logic is failing and can fix it.
        </p>
      </div>
    </div>
  );
};