import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { ShieldCheck, ArrowLeft, Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-10">
      <div className="space-y-3">
        <a href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8a6e2a] hover:text-[#C9A84C] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </a>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#C9A84C]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Data Privacy & Security</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-[#f5f3f0]">Privacy Policy</h1>
        <p className="text-xs font-mono text-[#8a6e2a]">
          Version 1.0 • NDPR & GDPR Compliant • Last updated: September 2026
        </p>
      </div>

      <GlassCard className="p-8 space-y-8 text-xs font-sans text-[#c4c0bb] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">1. Data We Collect</h2>
          <p>
            We collect minimal, high-intent data necessary to operate our sovereign architectural suite: email addresses, subscription tier records, diagnostic target URLs, and user messages submitted to the PRIME Oracle for continuity profiling.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">2. How We Use Data</h2>
          <p>
            Collected data is utilized strictly to provision application services, verify Paystack payment settlements, provide 9:47 PM scheduled philosophical transmissions, and calibrate PRIME AI memory parameters to your personal cognitive profile. We never monetize, package, or sell user records.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">3. AI Processing & Model Disclosure</h2>
          <p>
            Conversational inputs to PRIME Oracle and Dream Forge are transmitted via encrypted server-side proxy routes to enterprise LLM endpoints (Groq and Google Gemini). Third-party AI providers process inferences ephemerally and are strictly bound by enterprise agreements prohibiting the training of foundational models on your submitted architecture specs.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">4. Data Storage & Supabase Architecture</h2>
          <p>
            All persistent tenant documents, profile records, and subscription states are maintained in PostgreSQL databases managed by Supabase, isolated by strict Row-Level Security (RLS) policies. Data at rest is encrypted via AES-256.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">5. Your Rights (NDPR & GDPR)</h2>
          <p>
            In alignment with the Nigeria Data Protection Regulation (NDPR) and the General Data Protection Regulation (GDPR), you retain absolute rights to: access your stored profile and memory traces; export all architectural records in JSON/PDF format; rectify inaccuracies; or request complete, irreversible deletion of your tenant footprint.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">6. Cookies & Client-Side Storage</h2>
          <p>
            We utilize first-party cookies and local storage tokens solely for administrative authentication sessions, theme preference persistence (Dark/Light), offline service worker caching, and sound synthesis preferences. Refer to our Cookie Policy for granular controls.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">7. Authorized Third Parties</h2>
          <p>
            Data exchange is confined to verified technical partners: Paystack (payment authorization), Resend (transactional email dispatches), Google Gemini / Groq (advisory inference), and Supabase (data persistence).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">8. Security Hardening Measures</h2>
          <p>
            Our infrastructure enforces HTTPS TLS 1.3 encryption, Content Security Policies (CSP), sub-second rate limiters, HMAC-SHA512 webhook signature verification, and periodic automated self-diagnostic audits.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">9. Protection of Minors</h2>
          <p>
            Jadai Studios platforms are tailored for professional engineers, entrepreneurs, and adult builders. We do not intentionally harvest data from individuals under 18 years of age.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">10. Data Protection Officer (DPO) Contact</h2>
          <p>
            For privacy inquiries, data deletion requests, or regulatory audits:
            <br />
            <strong>Data Privacy Desk</strong> • Jadai Studios
            <br />
            Jos, Plateau State, Nigeria • Email: jadaistudiosoffcl@gmail.com
          </p>
        </section>
      </GlassCard>
    </div>
  );
}
