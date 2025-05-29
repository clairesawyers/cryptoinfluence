import axios from 'axios';
import { VideoItem } from '../types';

const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || 'appnpn5eiYhOp4Exx';
const AIRTABLE_TABLE_ID = import.meta.env.VITE_AIRTABLE_TABLE_ID || 'tblfeAwTomNTe6hmS';

const airtableClient = axios.create({
  baseURL: 'https://api.airtable.com/v0',
  headers: {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

airtableClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('Airtable API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config.url,
        method: error.config.method,
      });
    }
    return Promise.reject(error);
  }
);

interface AirtableResponse {
  records: Array<{
    id: string;
    fields: Record<string, any>;
  }>;
  offset?: string;
}


export const fetchVideos = async (
  _limit: number = 2,
  _offset?: string,
  _sortBy: 'newest' | 'oldest' | 'most_viewed' = 'newest',
  _influencerFilter?: string
): Promise<{ videos: VideoItem[]; nextOffset?: string }> => {
  try {
    const url = `/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;
    
    console.log('Fetching videos from URL:', url);
    const response = await airtableClient.get<AirtableResponse>(url);
    console.log('Response received, records count:', response.data.records.length);
    
    return {
      videos: response.data.records.map(record => ({
        id: record.id,
        title: record.fields.Title || 'Untitled Video',
        thumbnail_url: record.fields.Thumbnail || undefined,
        duration_seconds: record.fields['Length (Seconds)'] || 0,
        published_at: record.fields.createdTime || new Date().toISOString(),
        publish_date: record.fields['Publish Date'] || record.fields.createdTime || new Date().toISOString(),
        view_count: record.fields['Views Count'] || 0,
        like_count: record.fields['Likes Count'] || 0,
        influencer: {
          id: record.fields.Influencer_Relation?.[0] || 'unknown',
          display_name: record.fields['Influencer Name'] || record.fields.Platform || 'Unknown Creator',
          profile_image_url: record.fields['Influencer Icon']?.[0] || record.fields['Profile Image'] || undefined,
          relation: record.fields.Influencer_Relation || undefined,
        },
      })),
      nextOffset: response.data.offset,
    };
  } catch (error) {
    console.error('Error fetching videos from Airtable:', error);
    throw new Error('Failed to fetch videos. Please try again later.');
  }
};

export const fetchInfluencers = async (): Promise<string[]> => {
  try {
    const url = `/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;
    
    console.log('Fetching influencers from URL:', url);
    const response = await airtableClient.get<AirtableResponse>(url);
    console.log('Response received, records count:', response.data.records.length);
    
    const influencerNames = new Set<string>();
    response.data.records.forEach(record => {
      if (record.fields.Platform) {
        influencerNames.add(record.fields.Platform);
      }
    });
    
    return Array.from(influencerNames);
  } catch (error) {
    console.error('Error fetching influencers from Airtable:', error);
    throw new Error('Failed to fetch influencers. Please try again later.');
  }
};
