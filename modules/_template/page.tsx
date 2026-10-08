import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';

export default function TemplatePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTestCall = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/modules/_template?action=action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ping: 'hello from module template' }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Module Blueprint</span>
          <h1 className="text-3xl font-display text-[#f5f3f0] mt-1">Standard Module Template</h1>
        </div>
        <StatusBadge status="In Build" variant="gold" />
      </div>

      <GlassCard className="space-y-4">
        <p className="text-sm text-[#c4c0bb] leading-relaxed">
          This is the reference implementation of a Jadai Module. Future tools (resume editor, document analyzer, oracle) attach onto this standardized architecture without rewiring.
        </p>

        <div className="pt-2 flex gap-3">
          <Button onClick={handleTestCall} disabled={loading}>
            {loading ? 'Executing Action...' : 'Run Test Module API'}
          </Button>
        </div>

        {result && (
          <pre className="mt-4 p-4 rounded bg-[#050404] border border-[rgba(201,168,76,0.2)] text-xs font-mono text-[#e8c96a] overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </GlassCard>
    </div>
  );
}
