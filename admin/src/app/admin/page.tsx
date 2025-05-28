'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReviewQueue } from '@/components/admin/ReviewQueue';
import { ContentReview } from '@/components/admin/ContentReview';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function AdminPage() {
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
  
  const handleSelectContent = (contentId: number) => {
    setSelectedContentId(contentId);
  };
  
  const handleBackToQueue = () => {
    setSelectedContentId(null);
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">
              Crypto Influences Admin
            </h1>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {selectedContentId ? (
            <ContentReview 
              contentId={selectedContentId} 
              onBack={handleBackToQueue} 
            />
          ) : (
            <ReviewQueue onSelectContent={handleSelectContent} />
          )}
        </main>
        
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-sm text-gray-500 text-center">
              Crypto Influences Admin Console &copy; {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
