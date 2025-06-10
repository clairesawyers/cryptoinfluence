export interface AirtableRecord<T = Record<string, any>> {
  id: string;
  fields: T;
  createdTime: string;
}

export interface AirtableResponse<T = Record<string, any>> {
  records: AirtableRecord<T>[];
  offset?: string;
}

export interface AirtableError {
  error: {
    type: string;
    message: string;
  };
}

// Instrument table fields
export interface InstrumentFields {
  Symbol: string;
  Name: string;
  Category?: string;
  'Is Active': 'Yes' | 'No';
  'Logo URL'?: string;
}

// Price History table fields  
export interface PriceHistoryFields {
  Symbol: string;
  Price: number;
  'Date': string;
  Source?: string;
  Volume?: number;
  'Market Cap'?: number;
  'Recorded At'?: string;
}