'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Crypto Influences Admin</h1>
        <p className="mb-4">Redirecting to admin console...</p>
        <a 
          href="/admin" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Click here if you are not redirected automatically
        </a>
      </div>
    </div>
  );
}
