'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getAuthToken } from '@/lib/auth-storage';
import { formatTrpcError, trpc } from '@/lib/trpc';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? getAuthToken() : null;
  const { data: user, isLoading, isError, error } = trpc.auth.me.useQuery(undefined, {
    enabled: Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (!token) {
      router.replace('/login');
      return;
    }
    if (!isLoading && (isError || !user)) {
      router.replace('/login');
    }
  }, [token, isLoading, isError, user, router]);

  if (!token || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lex-text-muted">
        Loading…
      </div>
    );
  }

  if (isError && error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="max-w-md text-lex-risk-high" role="alert">
          {formatTrpcError(error.message)}
        </p>
        <p className="text-sm text-lex-text-muted">
          The dashboard requires the API to be running. The landing page and legal pages remain available.
        </p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center text-lex-text-muted">
        Verifying permissions…
      </div>
    );
  }

  return <>{children}</>;
}