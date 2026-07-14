'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      if (token) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isHydrated, token, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-slate-400 text-sm">Loading Battery Passport Platform...</p>
      </div>
    </div>
  );
}
