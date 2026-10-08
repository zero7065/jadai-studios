'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Lock, AlertCircle, KeyRound } from 'lucide-react';
import { StudioAudio } from '../../lib/watermark';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAdminCode('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = adminCode.trim();

    if (!code) {
      setError('Please enter the admin code.');
      return;
    }

    setLoading(true);
    setError('');
    StudioAudio.playClick();

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'jadaistudiosoffcl@gmail.com', password: code }),
      });
      const data = await res.json();
      if (data.success) {
        try {
          sessionStorage.setItem('jadai_admin_unlocked', 'true');
          localStorage.setItem('jadai_admin_unlocked', 'true');
        } catch {}
        StudioAudio.playSuccessArpeggio();
        setTimeout(() => {
          setLoading(false);
          onSuccess();
          onClose();
        }, 300);
      } else {
        throw new Error(data.error || 'Invalid admin code');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid admin code. Access denied.');
      StudioAudio.playError();
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admin Access">
      <form onSubmit={handleUnlock} className="space-y-4 select-none">
        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/40 border border-red-800/40 text-xs font-mono text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a857e]" />
            <input
              type="password"
              autoFocus
              value={adminCode}
              onChange={(e) => {
                setAdminCode(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter admin code"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.3)] text-[#f5f3f0] font-mono text-sm placeholder-[#5a554e] focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[rgba(196,192,187,0.2)] bg-transparent hover:bg-white/5 text-[#c4c0bb] font-mono text-xs cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#e8c96a] text-[#050404] font-mono text-xs font-bold uppercase tracking-wider hover:opacity-95 cursor-pointer shadow active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Unlock'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminPasscodeModal;
