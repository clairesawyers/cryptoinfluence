/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_AIRTABLE_API_KEY: string;
    readonly VITE_AIRTABLE_BASE_ID: string;
    readonly VITE_AIRTABLE_TABLE_ID: string;
    // Add more environment variables as needed
    readonly VITE_APP_TITLE?: string;
    readonly VITE_DEBUG_MODE?: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }