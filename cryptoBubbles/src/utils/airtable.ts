// src/utils/airtable.ts
import type { VideoItem, Influencer, ContentItem } from '../types';

const BASE_URL = `https://api.airtable.com/v0/${
  import.meta.env.VITE_AIRTABLE_BASE_ID
}`;

const VIDEOS_URL = `${BASE_URL}/${encodeURIComponent(import.meta.env.VITE_AIRTABLE_TABLE_ID)}`;
const CONTENT_ITEMS_URL = `${BASE_URL}/Content%20Items`;

// Helper function to build date filter for Airtable
function buildDateFilter(selectedDate: Date, viewMode: 'day' | 'week' | 'month'): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  let startDate: Date;
  let endDate: Date;

  switch (viewMode) {
    case 'day':
      // For day mode, just match the exact date
      const dayStr = formatDate(selectedDate);
      console.log('📊 Filtering for exact date:', dayStr);
      return `{Publish Date} = '${dayStr}'`;
    
    case 'week':
      // Get start of week (Sunday)
      startDate = new Date(selectedDate);
      startDate.setDate(selectedDate.getDate() - selectedDate.getDay());
      // Get end of week (Saturday)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      break;
    
    case 'month':
      // Get start of month
      startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      // Get end of month
      endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      break;
    
    default:
      return '';
  }

  // For week/month, use date range
  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);
  
  console.log('📊 Date range:', startDateStr, 'to', endDateStr);
  
  return `AND({Publish Date} >= '${startDateStr}', {Publish Date} <= '${endDateStr}')`;
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
    const params = new URLSearchParams({
      'sort[0][field]': 'Publish Date',
      'sort[0][direction]': 'desc'
    });

    // Add date filtering if selectedDate is provided
    if (selectedDate && viewMode) {
      const dateFilter = buildDateFilter(selectedDate, viewMode);
      console.log('🗓️ Selected date:', selectedDate.toISOString());
      console.log('📅 View mode:', viewMode);
      console.log('🔍 Date filter formula:', dateFilter);
      if (dateFilter) {
        params.append('filterByFormula', dateFilter);
      }
    } else {
      console.log('❌ No date filtering - selectedDate:', selectedDate, 'viewMode:', viewMode);
    }

    const res = await fetch(`${CONTENT_ITEMS_URL}?${params}`, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`
      }
    });
    
    if (!res.ok) {
      const err = await res.json();
      console.error('Error fetching content items:', err);
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
    }
    
    return data.records.map(record => ({
      id: record.id,
      thumbnail_url: record.fields['Thumbnail'] as string,
      title: record.fields['Title'] as string,
      influencer_name: record.fields['Influencer Name'] as string,
      watch_url: record.fields['Watch URL'] as string,
      views_count: record.fields['Views Count'] as number,
      publish_date: record.fields['Publish Date'] as string,
      short_summary: record.fields['Short Summary'] as string | undefined,
    }));
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