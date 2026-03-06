'use client';

import { useState } from 'react';
import { login } from '@/actions/auth';

export default function AdminLoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-stone-400">
          Usuario
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          placeholder="admin o usuario de sucursal"
          className="mt-1 w-full rounded-lg border border-surface-500 bg-surface-700 px-4 py-3 text-white placeholder:text-stone-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-stone-400">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••"
          className="mt-1 w-full rounded-lg border border-surface-500 bg-surface-700 px-4 py-3 text-white placeholder:text-stone-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-600 py-3 text-base font-bold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}
