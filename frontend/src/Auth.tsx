import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION, REGISTER_MUTATION } from './graphql';

export function Auth({ onAuth }: { onAuth: () => void }) {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);

  const [login, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);
  const [register, { loading: registerLoading }] = useMutation(REGISTER_MUTATION);
  const loading = loginLoading || registerLoading;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const mutate = mode === 'login' ? login : register;
      const { data } = await mutate({ variables: { email, password } });
      const token = (data?.login ?? data?.register)?.token as string | undefined;
      if (!token) throw new Error('No token returned');
      localStorage.setItem('token', token);
      onAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="password (min 8 chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}
      </button>
      <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        Switch to {mode === 'login' ? 'register' : 'login'}
      </button>
    </form>
  );
}
