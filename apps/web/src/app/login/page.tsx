'use client';

import { Scale } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { setAuthToken } from '@/lib/auth-storage';
import { formatTrpcError, trpc } from '@/lib/trpc';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      setAuthToken(data.token);
      router.push('/dashboard');
    },
    onError: (err) => setError(formatTrpcError(err.message)),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setAuthToken(data.token);
      router.push('/onboarding');
    },
    onError: (err) => setError(formatTrpcError(err.message)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isRegister) {
      registerMutation.mutate({
        email,
        password,
        ...(name ? { name } : {}),
      });
    } else {
      loginMutation.mutate({ email, password });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
            <Scale className="text-lex-accent-gold" size={28} aria-hidden />
            <span className="font-display text-2xl font-bold">LexAI</span>
          </Link>
          <CardTitle>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</CardTitle>
          <CardDescription>
            {isRegister
              ? 'Empiece su consulta jurídica gratuita'
              : 'Acceda a su despacho digital'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              type="password"
              placeholder="Contraseña (mín. 8 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
            {error && (
              <p className="text-sm text-lex-risk-high" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Procesando…' : isRegister ? 'Registrarse' : 'Entrar'}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="mt-4 w-full text-center text-sm text-lex-text-secondary hover:text-lex-accent-gold"
          >
            {isRegister ? '¿Ya tiene cuenta? Inicie sesión' : '¿Nuevo? Cree su cuenta gratis'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}