import React, { useState } from 'react';
import { LockKeyhole } from 'lucide-react';

interface AdminPasswordGateProps {
  onUnlock: () => void;
}

export const AdminPasswordGate: React.FC<AdminPasswordGateProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (!adminPassword) {
      setError('Admin access is not configured. Set VITE_ADMIN_PASSWORD in the deployment environment.');
      return;
    }

    if (password !== adminPassword) {
      setError('Incorrect password. Please try again.');
      return;
    }

    setError('');
    onUnlock();
  };

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <LockKeyhole aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Admin access</h1>
        <p className="mt-2 text-sm text-gray-600">Enter the admin password to continue.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label htmlFor="admin-password" className="sr-only">Admin password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError('');
            }}
            required
            className="min-h-12 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            placeholder="Password"
          />
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            className="min-h-12 w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Continue to admin
          </button>
        </form>
      </section>
    </main>
  );
};
