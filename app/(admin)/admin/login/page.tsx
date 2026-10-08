import React, { useState } from 'react';
import GlassCard from '../../../../components/ui/GlassCard';
import Button from '../../../../components/ui/Button';
import Logo from '../../../../components/layout/Logo';
import { ShieldCheck, Lock, Mail } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('jadaistudiosoffcl@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Authentication rejected');
      }
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050404] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-display text-[#f5f3f0]">Admin Lounge Access</h1>
          <p className="text-xs font-mono text-[#8a6e2a]">
            Authorized personnel only • Level 1 Cryptographic Portal
          </p>
        </div>

        <GlassCard className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#8a6e2a] mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a6e2a]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3.5 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-mono text-xs focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#8a6e2a] mb-1">
                Password / Master Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a6e2a]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-3.5 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-mono text-xs focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded bg-[rgba(192,57,43,0.15)] border border-[#C0392B] text-xs font-mono text-[#f5f3f0]">
                {error}
              </div>
            )}

            <Button type="submit" size="md" className="w-full" disabled={loading}>
              {loading ? 'Authenticating...' : 'Enter Lounge'}
            </Button>
          </form>

          <div className="pt-2 text-center">
            <a href="/" className="text-xs font-mono text-[#8a6e2a] hover:text-[#C9A84C] transition-colors">
              ← Return to Public Experience
            </a>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
