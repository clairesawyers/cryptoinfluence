// src/utils/airtable.ts
import type { VideoItem, Influencer, ContentItem } from '../types';

// Legacy configuration for videos
const BASE_URL = `https://api.airtable.com/v0/${
  import.meta.env.VITE_AIRTABLE_BASE_ID
}`;

const VIDEOS_URL = `${BASE_URL}/${encodeURIComponent(import.meta.env.VITE_AIRTABLE_TABLE_ID)}`;

// New Content Items configuration
const CONTENT_ITEMS_BASE_URL = `https://api.airtable.com/v0/${
  import.meta.env.VITE_CONTENT_ITEMS_AIRTABLE_BASE_ID
}`;
const CONTENT_ITEMS_URL = `${CONTENT_ITEMS_BASE_URL}/${
  import.meta.env.VITE_CONTENT_ITEMS_AIRTABLE_TABLE_ID
}`;

// Helper function to build date filter for Airtable
function buildDateFilter(selectedDate: Date, viewMode: 'day' | 'week' | 'month'): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  let startDate: Date;
  let endDate: Date;
  let dateFilter: string;

  switch (viewMode) {
    case 'day':
      // For day mode, just match the exact date
      const dayStr = formatDate(selectedDate);
      console.log('📊 Filtering for exact date:', dayStr);
      dateFilter = `{Publish Date} = '${dayStr}'`;
      break;
    
    case 'week':
      // Get start of week (Sunday)
      startDate = new Date(selectedDate);
      startDate.setDate(selectedDate.getDate() - selectedDate.getDay());
      // Get end of week (Saturday)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      const weekStartStr = formatDate(startDate);
      const weekEndStr = formatDate(endDate);
      console.log('📊 Date range:', weekStartStr, 'to', weekEndStr);
      dateFilter = `AND({Publish Date} >= '${weekStartStr}', {Publish Date} <= '${weekEndStr}')`;
      break;
    
    case 'month':
      // Get start of month
      startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      // Get end of month
      endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      const monthStartStr = formatDate(startDate);
      const monthEndStr = formatDate(endDate);
      console.log('📊 Date range:', monthStartStr, 'to', monthEndStr);
      dateFilter = `AND({Publish Date} >= '${monthStartStr}', {Publish Date} <= '${monthEndStr}')`;
      break;
    
    default:
      dateFilter = '';
  }

  // Always add the Publish Status = "Active" filter
  if (dateFilter) {
    return `AND(${dateFilter}, {Publish Status} = 'Active')`;
  } else {
    return `{Publish Status} = 'Active'`;
  }
}

// Test function to list all tables in the base
export async function listAirtableTables(): Promise<void> {
  try {
    console.log('🔍 Testing Airtable connection...');
    console.log('📍 Base ID:', import.meta.env.VITE_AIRTABLE_BASE_ID);
    
    // Try to get base schema (this might not work with all API keys)
    const schemaUrl = `https://api.airtable.com/v0/meta/bases/${import.meta.env.VITE_AIRTABLE_BASE_ID}/tables`;
    console.log('🌐 Schema URL:', schemaUrl);
    
    const res = await fetch(schemaUrl, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`
      }
    });
    
    console.log('📊 Schema response status:', res.status, res.statusText);
    
    if (res.ok) {
      const schema = await res.json();
      console.log('📋 Available tables:', schema);
    } else {
      console.log('❌ Cannot access schema, trying direct table access...');
      
      // Try different common table names and the existing table ID
      const tableNames = [
        'Content Items', 
        'Content_Items', 
        'Videos', 
        'Video_Content',
        import.meta.env.VITE_AIRTABLE_TABLE_ID // Use the existing table ID from env
      ];
      
      for (const tableName of tableNames) {
        const testUrl = `${BASE_URL}/${encodeURIComponent(tableName)}?maxRecords=1`;
        console.log(`🧪 Testing table: "${tableName}" at ${testUrl}`);
        
        const testRes = await fetch(testUrl, {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`
          }
        });
        
        console.log(`📊 "${tableName}" response:`, testRes.status, testRes.statusText);
        
        if (testRes.ok) {
          const data = await testRes.json();
          console.log(`✅ Found table "${tableName}" with ${data.records?.length || 0} records`);
          if (data.records?.[0]) {
            console.log(`🔬 Sample fields in "${tableName}":`, Object.keys(data.records[0].fields));
          }
        }
      }
    }
  } catch (error) {
    console.error('💥 Error testing Airtable:', error);
  }
}

export async function fetchVideosFromAirtable(limit: number): Promise<VideoItem[]> {
  const params = new URLSearchParams({
    maxRecords: limit.toString(),
    'sort[0][field]': 'Publish Date',
    'sort[0][direction]': 'desc'
  });

  const res = await fetch(`${VIDEOS_URL}?${params}`, {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`
    }
  });
  
  if (!res.ok) {
    const err = await res.json();
    console.error('Airtable error response:', err);
    throw new Error(err.error?.message || 'Airtable fetch failed');
  }

  const { records } = await res.json() as {
    records: Array<{
      id: string;
      fields: Record<string, unknown>;
    }>;
  };

  // Log first record to debug field mappings
  if (records.length > 0) {
    console.log('First record fields:', records[0].fields);
  }

  return records.map((rec) => {
    const f = rec.fields;
    
    const influencer: Influencer = {
      id: rec.id,
      display_name: f['Influencer Name'] as string,
      profile_image_url: (f['Influencer Icon'] as string[] | undefined)?.[0],
      platform: f['Platform'] as Influencer['platform']
    };

    // Changed thumbnail field to match Airtable field ID
    const video: VideoItem = {
      id: rec.id,
      title: f['Title'] as string,
      thumbnail_url: f['Thumbnail'] as string | undefined, // Updated field name
      duration_seconds: (f['Length (Seconds)'] as number) ?? 0,
      published_at: f['Publish Date'] as string,
      view_count: (f['Views Count'] as number) ?? 0,
      like_count: (f['Likes Count'] as number) ?? 0,
      influencer
    };

    // Debug log for thumbnail URL
    if (!video.thumbnail_url) {
      console.log('Missing thumbnail for video:', video.title);
    }

    return video;
  });
}

export async function fetchContentItems(selectedDate?: Date, viewMode?: 'day' | 'week' | 'month'): Promise<ContentItem[]> {
  try {
    console.log('📦 fetchContentItems: Starting fetch...');
    console.log('🔑 Using Content Items Base ID:', import.meta.env.VITE_CONTENT_ITEMS_AIRTABLE_BASE_ID);
    console.log('📋 Using Content Items Table ID:', import.meta.env.VITE_CONTENT_ITEMS_AIRTABLE_TABLE_ID);
    console.log('🌐 Content Items URL:', CONTENT_ITEMS_URL);
    
    const params = new URLSearchParams({
      'sort[0][field]': 'Publish Date',
      'sort[0][direction]': 'desc'
    });

    // Add filtering - always filter for Active status
    let filterFormula: string;
    if (selectedDate && viewMode) {
      filterFormula = buildDateFilter(selectedDate, viewMode);
      console.log('🗓️ Selected date:', selectedDate.toISOString());
      console.log('📅 View mode:', viewMode);
    } else {
      // Even without date filtering, still filter for Active status
      filterFormula = `{Publish Status} = 'Active'`;
      console.log('📊 No date filtering, but filtering for Active status only');
    }
    
    console.log('🔍 Filter formula:', filterFormula);
    params.append('filterByFormula', filterFormula);

    console.log('🚀 Making request to:', `${CONTENT_ITEMS_URL}?${params}`);
    
    const res = await fetch(`${CONTENT_ITEMS_URL}?${params}`, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_CONTENT_ITEMS_AIRTABLE_API_KEY}`
      }
    });
    
    console.log('📡 Response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const err = await res.json();
      console.error('❌ Error fetching content items:', err);
      return [];
    }

    const data = await res.json() as {
      records: Array<{
        id: string;
        fields: Record<string, unknown>;
      }>;
    };
    
    console.log('📦 Filtered records returned:', data.records?.length || 0);
    if (data.records?.length > 0) {
      console.log('📅 Sample record dates:', data.records.slice(0, 3).map(r => r.fields['Publish Date']));
      console.log('🪙 Sample record coins mentioned:', data.records.slice(0, 3).map(r => r.fields['Coins Mentioned']));
      console.log('🖼️ First record fields:', Object.keys(data.records[0].fields));
      console.log('🔍 First record raw data:', data.records[0].fields);
    }
    
    return data.records.map(record => {
      // Check if Thumbnail is an array (like in the legacy code)
      const thumbnailField = record.fields['Thumbnail'];
      let thumbnailUrl: string = '';
      
      if (Array.isArray(thumbnailField) && thumbnailField.length > 0) {
        // If it's an array of attachment objects
        thumbnailUrl = thumbnailField[0].url || thumbnailField[0] || '';
      } else if (typeof thumbnailField === 'string') {
        // If it's a direct string URL
        thumbnailUrl = thumbnailField;
      } else if (thumbnailField && typeof thumbnailField === 'object' && 'url' in thumbnailField) {
        // If it's an object with a url property
        thumbnailUrl = (thumbnailField as any).url;
      }
      
      // 🔧 FIXED: Handle array-based Coins Mentioned field
      let coinsMentioned: string[] | undefined;
      const coinsMentionedField = record.fields['Coins Mentioned'];

      console.log('🔍 Raw Coins Mentioned field:', coinsMentionedField);
      console.log('🔍 Field type:', typeof coinsMentionedField);

      if (Array.isArray(coinsMentionedField)) {
        // ✅ Handle array format (which is what you actually get)
        coinsMentioned = coinsMentionedField
          .filter(coin => {
            // Filter out null, undefined, empty strings, and error messages
            return coin != null && 
                   coin !== '' && 
                   typeof coin === 'string' &&
                   !coin.includes('Not found') &&
                   !coin.includes('(400)') &&
                   coin.trim().length > 0;
          })
          .map(coin => coin.trim().toUpperCase())
          .filter((coin, index, arr) => arr.indexOf(coin) === index); // Remove duplicates
          
        console.log('🪙 Parsed coins from array:', coinsMentioned);
      } else if (typeof coinsMentionedField === 'string') {
        // 🔄 Keep string parsing as fallback
        try {
          let cleanedString = coinsMentionedField;
          if (cleanedString.startsWith('"') && cleanedString.endsWith('"')) {
            cleanedString = cleanedString.slice(1, -1);
          }
          cleanedString = cleanedString.replace(/\\"/g, '');
          
          if (cleanedString && cleanedString.length > 0) {
            coinsMentioned = cleanedString
              .split(',')
              .map(coin => coin.trim().toUpperCase())
              .filter(coin => coin.length > 0 && !coin.includes('Not found'));
          }
          console.log('🪙 Parsed coins from string:', coinsMentioned);
        } catch (error) {
          console.error('❌ Error parsing coins mentioned field:', error);
          coinsMentioned = undefined;
        }
      } else {
        console.log('⚠️ Coins Mentioned field is null/undefined');
        coinsMentioned = undefined;
      }

      // Set to undefined if empty
      if (coinsMentioned && coinsMentioned.length === 0) {
        coinsMentioned = undefined;
      }
      
      const contentItem = {
        id: record.id,
        thumbnail_url: thumbnailUrl,
        title: record.fields['Title'] as string,
        influencer_name: record.fields['Influencer Name'] as string,
        watch_url: record.fields['Watch URL'] as string,
        views_count: record.fields['Views Count'] as number,
        publish_date: record.fields['Publish Date'] as string,
        short_summary: record.fields['Short Summary'] as string | undefined,
        coins_mentioned: coinsMentioned,
        publish_status: record.fields['Publish Status'] as string | undefined,
      };
      
      // Debug log each content item
      console.log('📋 Content Item:', contentItem.title);
      console.log('🖼️ Thumbnail URL:', contentItem.thumbnail_url);
      console.log('🔍 Raw Thumbnail field:', thumbnailField);
      console.log('✅ Publish Status:', contentItem.publish_status);
      console.log('🪙 Raw Coins Mentioned field:', record.fields['Coins Mentioned']);
      console.log('🪙 Processed coins_mentioned:', contentItem.coins_mentioned);
      console.log('🏷️ Available fields:', Object.keys(record.fields));
      
      // Investment data debugging summary
      console.log('💰 Investment Data Summary for', contentItem.title);
      if (coinsMentioned && coinsMentioned.length > 0) {
        console.log('  ✅ Successfully parsed', coinsMentioned.length, 'coins:', coinsMentioned.join(', '));
      } else {
        console.log('  ❌ No coins mentioned or parsing failed');
      }
      
      return contentItem;
    });
  } catch (error) {
    console.error('💥 Error fetching content items:', error);
    return [];
  }
}

export function validateContentItem(item: unknown): ContentItem | null {
  if (!item || typeof item !== 'object') {
    return null;
  }
  
  const record = item as Record<string, unknown>;
  
  if (!record['Thumbnail'] || !record['Title'] || !record['Watch URL']) {
    console.warn('Missing required fields in content item:', item);
    return null;
  }

  return {
    id: (record.id as string) || '',
    thumbnail_url: (record['Thumbnail'] as string) || '',
    title: (record['Title'] as string) || 'Untitled Video',
    influencer_name: (record['Influencer Name'] as string) || 'Unknown Creator',
    watch_url: (record['Watch URL'] as string) || '',
    views_count: typeof record['Views Count'] === 'number' ? record['Views Count'] : 0,
    publish_date: (record['Publish Date'] as string) || new Date().toISOString(),
  };
}