import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Cookie, ArrowLeft } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-10">
      <div className="space-y-3">
        <a href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8a6e2a] hover:text-[#C9A84C] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </a>
        <div className="flex items-center gap-2">
          <Cookie className="w-5 h-5 text-[#C9A84C]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Storage Disclosure</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-[#f5f3f0]">Cookie Policy</h1>
        <p className="text-xs font-mono text-[#8a6e2a]">
          Version 1.0 • Last reviewed: September 2026
        </p>
      </div>

      <GlassCard className="p-8 space-y-8 text-xs font-sans text-[#c4c0bb] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">1. What Are Cookies?</h2>
          <p>
            Cookies are compact cryptographic text files and client-side storage keys deposited in your browser environment when accessing Jadai Studios platforms. They allow our edge servers to recognize authenticated sessions, maintain user preferences, and ensure seamless offline PWA functionality.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">2. Categories of Storage We Use</h2>
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)]">
              <strong className="text-[#f5f3f0] block mb-1">Strictly Essential Cookies & Tokens</strong>
              <span>Required for platform routing, cryptographic CSRF mitigation, admin quick-login session persistence, and security verification.</span>
            </div>
            <div className="p-3 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)]">
              <strong className="text-[#f5f3f0] block mb-1">Preference & State Storage</strong>
              <span>Preserves your dark/light theme choices, sound synthesis toggles, and offline PWA database caches.</span>
            </div>
            <div className="p-3 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)]">
              <strong className="text-[#f5f3f0] block mb-1">Telemetry & Diagnostic Cookies</strong>
              <span>Used internally to compute TTFB latency, API error counts, and platform diagnostic scores without third-party ad profiling.</span>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">3. Third-Party Services</h2>
          <p>
            Payment transactions initiated through Paystack may deploy specialized fraud-prevention telemetry tokens. We do not utilize Google DoubleClick, Meta Pixel, or commercial remarketing trackers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">4. Managing Cookie Choices</h2>
          <p>
            You can modify, block, or clear cookies via your browser preferences at any moment. Note that disabling essential session cookies will inhibit administrative quick-login and offline synchronization capabilities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">5. Questions & Audits</h2>
          <p>
            Direct questions regarding our zero-ad tracking architecture to:
            <br />
            <strong>Infrastructure Privacy Desk</strong> • Jadai Studios
            <br />
            Email: jadaistudiosoffcl@gmail.com • Jos, Nigeria
          </p>
        </section>
      </GlassCard>
    </div>
  );
}
