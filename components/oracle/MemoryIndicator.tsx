import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Brain, Trash2, ShieldCheck, Sparkles } from 'lucide-react';
import { useToast } from '../providers/ToastProvider';

export interface UserMemoryItem {
  id: string;
  key: string;
  value: string;
  confidence?: number;
  created_at?: string;
}

export interface MemoryIndicatorProps {
  memories: UserMemoryItem[];
  onDeleteMemory?: (id: string) => void;
  className?: string;
}

export const MemoryIndicator: React.FC<MemoryIndicatorProps> = ({
  memories,
  onDeleteMemory,
  className = '',
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  const count = memories.length;

  const handleDelete = (id: string, key: string) => {
    if (onDeleteMemory) {
      onDeleteMemory(id);
    }
    showToast(`Memory "${key}" expunged from neural matrix.`, 'info');
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(10,9,8,0.7)] hover:border-[#C9A84C] text-[11px] font-mono text-[#e8c96a] transition-all cursor-pointer backdrop-blur-md shadow-sm ${className}`}
        title="View memories retained by PRIME"
      >
        <Brain className="w-3.5 h-3.5 text-[#C9A84C]" />
        <span>PRIME remembers {count} {count === 1 ? 'insight' : 'insights'}</span>
      </button>

      {/* Memory Transparency Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="PRIME Cognitive Memory Ledger"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-[#C9A84C] pb-2 border-b border-[rgba(201,168,76,0.15)]">
            <ShieldCheck className="w-4 h-4" />
            <span>RADICAL MEMORY TRANSPARENCY</span>
          </div>

          <p className="text-[#c4c0bb] font-sans leading-relaxed">
            PRIME extracts atomic observations to maintain continuity across your sessions. You possess total sovereignty over this ledger: purge any memory below instantly.
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 pt-1">
            {memories.length === 0 ? (
              <div className="p-4 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] text-center text-[#8a6e2a]">
                Zero memories recorded. Complete profiling or chat to form cognitive bonds.
              </div>
            ) : (
              memories.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded bg-[#050404] border border-[rgba(201,168,76,0.2)] flex items-start justify-between gap-3 group hover:border-[#C9A84C] transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#C9A84C] tracking-widest block">
                      {m.key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-[#f5f3f0] font-sans block">
                      {m.value}
                    </span>
                    {m.confidence && (
                      <span className="text-[10px] text-[#8a6e2a] block">
                        Confidence: {Math.round(m.confidence * 100)}%
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(m.id, m.key)}
                    className="p-1 rounded text-[#8a6e2a] hover:text-[#C0392B] hover:bg-[rgba(192,57,43,0.15)] transition-colors cursor-pointer"
                    title="Delete memory"
                    aria-label={`Delete ${m.key}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Close Ledger
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MemoryIndicator;
