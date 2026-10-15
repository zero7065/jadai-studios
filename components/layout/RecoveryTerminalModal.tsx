import React, { useState, useEffect, useRef } from 'react';
import { StudioAudio } from '../../lib/watermark';

interface RecoveryTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecoveryTerminalModal: React.FC<RecoveryTerminalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [booting, setBooting] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [menuOption, setMenuOption] = useState<string | null>(null);
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [busy, setBusy] = useState(false);

  // Admin identity — fetched from the server (session-guarded), never hardcoded.
  const [adminEmail, setAdminEmail] = useState('');

  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Boot sequence
  useEffect(() => {
    if (isOpen) {
      setBooting(true);
      setAuthenticated(false);
      setPasscode('');
      setMenuOption(null);
      setOutputLines([]);
      setAdminEmail('');

      // Load the real admin email while the boot animation plays.
      let cancelled = false;
      fetch('/api/admin/credentials')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!cancelled && d?.success && d?.email) setAdminEmail(d.email);
        })
        .catch(() => {});

      const timer = setTimeout(() => {
        setBooting(false);
        setOutputLines([
          'JADAI TERMINAL v1.0 // SYSTEM BOOT VERIFIED',
          'PLATFORM KERNEL: SOVEREIGN 20-TAP DISASTER PORT',
          'SECURITY INTEGRITY: RESTRICTED TO SYSTEM OWNER (JEHU NANPAN)',
          '====================================================================',
          'ENTER 4-DIGIT RECOVERY PASSCODE OR ADMIN PASSWORD:',
        ]);
        StudioAudio.playClick();
      }, 800);

      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!booting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [booting, authenticated, menuOption]);

  const pushLines = (lines: string[]) => setOutputLines((prev) => [...prev, ...lines]);

  const callRecovery = async (body: Record<string, unknown>): Promise<any | null> => {
    try {
      const res = await fetch('/api/admin/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, passcode }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        return { error: data?.error || `Request rejected (HTTP ${res.status})` };
      }
      return data;
    } catch {
      return { error: 'Server unreachable. Check network and try again.' };
    }
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const attempt = passcode.trim();
    if (!attempt || busy) return;
    setBusy(true);
    const data = await callRecovery({ action: 'auth', passcode: attempt });
    setBusy(false);

    if (data && !data.error) {
      StudioAudio.playSuccessArpeggio();
      if (data.email) setAdminEmail(data.email);
      setAuthenticated(true);
      pushLines([
        `> ${attempt}`,
        '[ACCESS GRANTED] LEVEL 0 SOVEREIGN CLEARANCE ACKNOWLEDGED.',
        'SELECT RECOVERY DIRECTIVE [1 - 5]:',
        '  [1] View current credentials',
        '  [2] Change login email',
        '  [3] Change password',
        '  [4] Regenerate recovery passcode',
        '  [5] Exit terminal',
      ]);
    } else {
      StudioAudio.playClick();
      setShake(true);
      pushLines([`> ${attempt}`, `ACCESS DENIED: ${data?.error || 'INVALID PASSCODE.'}`]);
      setPasscode('');
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleMenuCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    setInputVal('');
    if (busy) return;

    if (menuOption) {
      const option = menuOption;
      setMenuOption(null);

      if (option === 'email') {
        if (!cmd.includes('@')) {
          pushLines([`> ${cmd}`, '[ERROR] Invalid email format.']);
          return;
        }
        setBusy(true);
        const data = await callRecovery({ action: 'set_email', email: cmd });
        setBusy(false);
        if (data && !data.error) {
          if (data.email) setAdminEmail(data.email);
          pushLines([`> ${cmd}`, `[COMMITTED] Admin login email updated to: ${data.email || cmd}`, 'Select directive [1 - 5]:']);
        } else {
          pushLines([`> ${cmd}`, `[ERROR] ${data?.error || 'Update failed.'}`]);
        }
        return;
      }

      if (option === 'password') {
        setBusy(true);
        const data = await callRecovery({ action: 'set_password', newPassword: cmd });
        setBusy(false);
        if (data && !data.error) {
          pushLines([
            '> ••••••••••••',
            '[COMMITTED] Master admin passphrase updated. New credentials active on next login.',
            'Select directive [1 - 5]:',
          ]);
        } else {
          pushLines(['> ••••••••••••', `[ERROR] ${data?.error || 'Update failed.'}`]);
        }
        return;
      }
      return;
    }

    switch (cmd) {
      case '1': {
        setBusy(true);
        const data = await callRecovery({ action: 'view' });
        setBusy(false);
        if (data && !data.error) {
          if (data.email) setAdminEmail(data.email);
          pushLines([
            '> 1',
            'ACTIVE CREDENTIALS:',
            `  Admin Email: ${data.email || adminEmail}`,
            `  Passcode: ${data.recoveryCode || '••••'}`,
            `  Role: SUPERADMIN / LEVEL 0`,
            `  Cluster: Jos Highlands Primary (WAT)`,
            'Select directive [1 - 5]:',
          ]);
        } else {
          pushLines(['> 1', `[ERROR] ${data?.error || 'Query failed.'}`]);
        }
        break;
      }

      case '2':
        setMenuOption('email');
        pushLines(['> 2', 'ENTER NEW ADMIN EMAIL ADDRESS:']);
        break;

      case '3':
        setMenuOption('password');
        pushLines(['> 3', 'ENTER NEW MASTER PASSWORD:']);
        break;

      case '4': {
        setBusy(true);
        const data = await callRecovery({ action: 'rotate_passcode' });
        setBusy(false);
        if (data && !data.error) {
          pushLines([
            '> 4',
            `[GENERATED] New 4-digit recovery passcode: ${data.recoveryCode}`,
            'STORE SAFELY. THIS PASSCODE IS REQUIRED FOR 20-TAP RECOVERY.',
            'Select directive [1 - 5]:',
          ]);
        } else {
          pushLines(['> 4', `[ERROR] ${data?.error || 'Rotation failed.'}`]);
        }
        break;
      }

      case '5':
      case 'exit':
      case 'quit':
        onClose();
        break;

      default:
        pushLines([`> ${cmd}`, 'UNKNOWN DIRECTIVE. Choose 1, 2, 3, 4, or 5.']);
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Jadai Disaster Recovery Terminal"
      className="fixed inset-0 z-[200] bg-[#0a0a0a] text-[#39FF14] font-mono text-xs p-4 sm:p-8 flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Scanline CRT Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25) 1px, transparent 1px, transparent 2px)',
          opacity: 0.25,
        }}
      />

      {/* Subtle Gold / Green Code Rain in Background */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-10 flex justify-between overflow-hidden font-mono text-[10px]">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            01010101011101010010101010001010101110101
          </div>
        ))}
      </div>

      {/* Terminal Header */}
      <header className="relative z-20 flex items-center justify-between border-b border-[#39FF14]/30 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-ping" />
          <span className="font-bold tracking-widest text-sm">
            JADAI TERMINAL v1.0 // LEVEL 0 RECOVERY
          </span>
        </div>
        <button
          onClick={onClose}
          className="px-2 py-0.5 border border-[#39FF14]/40 hover:bg-[#39FF14] hover:text-[#0a0a0a] transition-colors text-[11px]"
        >
          [ESC / CLOSE]
        </button>
      </header>

      {/* Terminal Viewport */}
      <main
        className={`relative z-20 flex-1 my-4 overflow-y-auto space-y-1 pr-2 transition-transform duration-100 ${
          shake ? 'translate-x-2' : ''
        }`}
      >
        {booting ? (
          <div className="space-y-1">
            <p className="animate-pulse">JADAI TERMINAL v1.0 // BOOTING...</p>
            <p className="opacity-70">CHECKING HARDWARE INTEGRITY... [OK]</p>
            <p className="opacity-70">INSPECTING POSTGRESQL POOL... [OK]</p>
            <p className="opacity-70">VERIFYING 20-TAP FREQUENCY... [AUTHENTICATED]</p>
            <p>...READY.</p>
          </div>
        ) : (
          <>
            {outputLines.map((line, idx) => (
              <div key={idx} className="leading-relaxed whitespace-pre-wrap">
                {line}
              </div>
            ))}

            {/* Input Line */}
            <div className="pt-2">
              {!authenticated ? (
                <form onSubmit={handlePasscodeSubmit} className="flex items-center gap-2">
                  <span className="text-[#39FF14]">ENTER PASSCODE:_</span>
                  <input
                    ref={inputRef}
                    type="password"
                    maxLength={40}
                    disabled={busy}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••"
                    className="bg-transparent border-b border-[#39FF14] text-[#39FF14] outline-none w-40 tracking-widest font-mono text-sm disabled:opacity-50"
                    autoFocus
                  />
                  <span className="inline-block w-2 h-4 bg-[#39FF14] animate-pulse" />
                </form>
              ) : (
                <form onSubmit={handleMenuCommand} className="flex items-center gap-2">
                  <span className="text-[#39FF14]">JADAI:_</span>
                  <input
                    ref={inputRef}
                    type="text"
                    disabled={busy}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    className="flex-1 bg-transparent text-[#39FF14] outline-none font-mono text-xs disabled:opacity-50"
                    autoFocus
                  />
                  <span className="inline-block w-2 h-4 bg-[#39FF14] animate-pulse" />
                </form>
              )}
            </div>
          </>
        )}
      </main>

      {/* Terminal Footer */}
      <footer className="relative z-20 border-t border-[#39FF14]/30 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] opacity-75">
        <span>STATUS: SOVEREIGN OPERATIONAL • JOS, NIGERIA</span>
        <span>PASSCODE: SERVER-VERIFIED • TYPE 5 TO EXIT</span>
      </footer>
    </div>
  );
};

export default RecoveryTerminalModal;
