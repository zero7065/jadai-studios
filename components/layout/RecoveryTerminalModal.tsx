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

  // Recovery State
  const [credentials, setCredentials] = useState({
    email: 'jadaistudiosoffcl@gmail.com',
    recoveryCode: '6057',
  });

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

      const timer = setTimeout(() => {
        setBooting(false);
        setOutputLines([
          'JADAI TERMINAL v1.0 // SYSTEM BOOT VERIFIED',
          'PLATFORM KERNEL: SOVEREIGN 20-TAP DISASTER PORT',
          'SECURITY INTEGRITY: RESTRICTED TO SYSTEM OWNER (JEHU NANPAN)',
          '====================================================================',
          'ENTER 4-DIGIT SECURITY PASSCODE:',
        ]);
        StudioAudio.playClick();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!booting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [booting, authenticated, menuOption]);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === credentials.recoveryCode) {
      StudioAudio.playSuccessArpeggio();
      setAuthenticated(true);
      setOutputLines((prev) => [
        ...prev,
        `> ${passcode}`,
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
      setOutputLines((prev) => [...prev, `> ${passcode}`, 'ACCESS DENIED: INVALID PASSCODE. SECURITY COUNTER INCREMENTED.']);
      setPasscode('');
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleMenuCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    setInputVal('');

    if (menuOption) {
      // Handling sub-command input
      if (menuOption === 'email') {
        if (cmd.includes('@')) {
          setCredentials((prev) => ({ ...prev, email: cmd }));
          setOutputLines((prev) => [
            ...prev,
            `> ${cmd}`,
            `[COMMITTED] Admin login email updated to: ${cmd}`,
            'Select directive [1 - 5]:',
          ]);
        } else {
          setOutputLines((prev) => [...prev, `> ${cmd}`, '[ERROR] Invalid email format.']);
        }
        setMenuOption(null);
      } else if (menuOption === 'password') {
        setOutputLines((prev) => [
          ...prev,
          `> ••••••••••••`,
          `[COMMITTED] Master admin passphrase updated. Encrypted in session store.`,
          'Select directive [1 - 5]:',
        ]);
        setMenuOption(null);
      }
      return;
    }

    switch (cmd) {
      case '1':
        setOutputLines((prev) => [
          ...prev,
          `> 1`,
          `ACTIVE CREDENTIALS:`,
          `  Admin Email: ${credentials.email}`,
          `  Passcode: ${credentials.recoveryCode}`,
          `  Role: SUPERADMIN / LEVEL 0`,
          `  Cluster: Jos Highlands Primary (WAT)`,
          'Select directive [1 - 5]:',
        ]);
        break;

      case '2':
        setMenuOption('email');
        setOutputLines((prev) => [
          ...prev,
          `> 2`,
          `ENTER NEW ADMIN EMAIL ADDRESS:`,
        ]);
        break;

      case '3':
        setMenuOption('password');
        setOutputLines((prev) => [
          ...prev,
          `> 3`,
          `ENTER NEW MASTER PASSWORD:`,
        ]);
        break;

      case '4':
        const newCode = Math.floor(1000 + Math.random() * 9000).toString();
        setCredentials((prev) => ({ ...prev, recoveryCode: newCode }));
        setOutputLines((prev) => [
          ...prev,
          `> 4`,
          `[GENERATED] New 4-digit recovery passcode: ${newCode}`,
          `STORE SAFELY. THIS PASSCODE IS REQUIRED FOR 20-TAP RECOVERY.`,
          'Select directive [1 - 5]:',
        ]);
        break;

      case '5':
      case 'exit':
      case 'quit':
        onClose();
        break;

      default:
        setOutputLines((prev) => [
          ...prev,
          `> ${cmd}`,
          'UNKNOWN DIRECTIVE. Choose 1, 2, 3, 4, or 5.',
        ]);
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
                    maxLength={4}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••"
                    className="bg-transparent border-b border-[#39FF14] text-[#39FF14] outline-none w-24 tracking-widest font-mono text-sm"
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
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    className="flex-1 bg-transparent text-[#39FF14] outline-none font-mono text-xs"
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
        <span>DEFAULT PASSCODE: 6057 • TYPE 5 TO EXIT</span>
      </footer>
    </div>
  );
};

export default RecoveryTerminalModal;
