'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * OAuth landing route — handles the Supabase redirect back from Google.
 * Supports both PKCE (?code=...) and implicit (#access_token=...) flows.
 * Exchanges the code for a session, then redirects home.
 */
export const AuthCallback: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const [status, setStatus] = useState<'working' | 'done' | 'error'>('working');
  const [message, setMessage] = useState('Completing sign-in…');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { supabase } = await import('../../lib/supabase/client');
        if (!supabase) {
          setStatus('error');
          setMessage('Supabase is not configured on this deployment — OAuth cannot complete.');
          return;
        }

        const params = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const code = params.get('code');
        const errorDesc = params.get('error_description') || hash.get('error_description');

        if (errorDesc) {
          setStatus('error');
          setMessage(decodeURIComponent(errorDesc));
          return;
        }

        if (code) {
          // PKCE flow — exchange the auth code for a session.
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          // Implicit flow — tokens land in the hash; getSession parses them.
          const { error } = await supabase.auth.getSession();
          if (error) throw error;
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            setStatus('error');
            setMessage('No session was returned from the OAuth provider. Try signing in again.');
            return;
          }
        }

        if (cancelled) return;
        setStatus('done');
        setMessage('Signed in. Returning to the studio…');
        setTimeout(() => {
          if (onNavigate) onNavigate('/');
          else window.location.href = '/';
        }, 1200);
      } catch (err: any) {
        if (cancelled) return;
        setStatus('error');
        setMessage(err?.message || 'Sign-in could not be completed.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [onNavigate]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)]">
        {status === 'working' && (
          <Loader2 className="w-10 h-10 text-[#C9A84C] animate-spin mx-auto" />
        )}
        {status === 'done' && (
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
        )}
        {status === 'error' && (
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
        )}
        <h1 className="text-xl font-display font-bold text-[#f5f3f0]">
          {status === 'working' ? 'Authenticating…' : status === 'done' ? 'Welcome back' : 'Sign-in failed'}
        </h1>
        <p className="text-xs font-mono text-[#c4c0bb] leading-relaxed">{message}</p>
        {status === 'error' && (
          <button
            onClick={() => {
              if (onNavigate) onNavigate('/');
              else window.location.href = '/';
            }}
            className="px-4 py-2 rounded-full bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-colors cursor-pointer"
          >
            Return to Studio
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
