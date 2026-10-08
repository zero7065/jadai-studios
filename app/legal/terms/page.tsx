import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Shield, FileText, ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-10">
      <div className="space-y-3">
        <a href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8a6e2a] hover:text-[#C9A84C] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </a>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#C9A84C]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Legal Framework</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-[#f5f3f0]">Terms of Service</h1>
        <p className="text-xs font-mono text-[#8a6e2a]">
          Version 1.0 • Last ratified: September 2026 • Governing Territory: Federal Republic of Nigeria
        </p>
      </div>

      <GlassCard className="p-8 space-y-8 text-xs font-sans text-[#c4c0bb] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">1. Acceptance of Terms</h2>
          <p>
            By accessing or utilizing Jadai Studios (operated under sovereign authority by Jehu Nanpan in Jos, Plateau State, Nigeria, and deployed via jadai.dev and associated platforms), you enter into an immutable, legally binding contract subject to these Terms of Service. If you do not consent to these stipulations, you are instructed to terminate usage immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">2. Description of Service</h2>
          <p>
            Jadai Studios provisions elite architectural engineering starter kits, automated site health telemetry scanners, conversational intelligence systems (PRIME Oracle), philosophical literature dispatches (The Book of Lies), and decentralized collaborative networks (JadaiHub). All digital assets are engineered for sovereign offline resilience.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">3. User Accounts & Studio Access</h2>
          <p>
            You are exclusively responsible for safeguarding administrative credentials, API access tokens, and private repositories procured through Jadai Studios. Transfer, sub-licensing, or malicious sharing of account access keys without explicit prior authorization will trigger instant key invalidation without refund.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">4. Intellectual Property & Code Ownership</h2>
          <p>
            All custom systems engineered specifically for verified paying clients become the property of the commissioning client upon full settlement. Proprietary starter architectures, sacred geometry visual assets, the PRIME persona matrix, and the Book of Lies canon remain the intellectual property of Jadai Studios and Jehu Nanpan. Commercial template licenses grant single-entity deployment rights.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">5. Prohibited Uses</h2>
          <p>
            Users are explicitly prohibited from: reverse engineering the 4-step AI fallback cascade; deploying platform crawlers designed to exhaust LLM inference quotas; attempting unauthorized administrative privilege escalation; or employing Jadai Studios frameworks for unlawful, predatory, or state-sanctioned surveillance mechanisms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">6. AI-Generated Content Disclaimer</h2>
          <p>
            Inferences, diagnostic guides, and architectural blueprints produced by PRIME Oracle and Dream Forge are advisory syntheses. While engineered with strict defensive guardrails, AI outputs must be reviewed by qualified human software engineers prior to mission-critical industrial deployment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">7. Payment Terms & Currencies</h2>
          <p>
            Transactions are processed securely in Nigerian Naira (NGN) and US Dollars (USD) via our verified Paystack gateway and international processing switches. Subscription tiers recur on a strict 30-day billing cycle unless cancelled prior to renewal.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">8. Refund Policy</h2>
          <p>
            Due to the immediate delivery of digital source code, private GitHub invites, and cryptographic keys, template purchases and architectural audit deposits are non-refundable once assets have been dispatched, except where non-delivery is verifiable on our infrastructure ledger.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">9. Limitation of Liability</h2>
          <p>
            In no event shall Jadai Studios, its founder, or affiliates be liable for indirect, incidental, punitive, or consequential damages resulting from network carrier blackouts, third-party LLM rate throttling, or client infrastructure misconfigurations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">10. Termination & Revocation</h2>
          <p>
            We reserve the right to suspend or terminate service access without notice upon discovery of security tampering, payment fraud, or violation of these Terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">11. Governing Law & Jurisdiction</h2>
          <p>
            These terms are governed in all respects by the laws of the Federal Republic of Nigeria. Any unresolved disputes shall be submitted to binding arbitration in Jos, Plateau State, Nigeria.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">12. Modifications to Terms</h2>
          <p>
            Jadai Studios reserves the right to amend these terms to reflect infrastructure upgrades or statutory requirements. Continued interaction with the platform constitutes acceptance of revised terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">13. Contact & Transmission Coordinates</h2>
          <p>
            For legal inquiries, NDA coordination, or enterprise service contracts:
            <br />
            <strong>Jadai Studios</strong> • Attention: Principal Architect (Jehu Nanpan)
            <br />
            Jos, Plateau State, Nigeria • Email: jadaistudiosoffcl@gmail.com
          </p>
        </section>
      </GlassCard>
    </div>
  );
}
