export interface FAQItem {
  q: string;
  a: string;
}

/**
 * Canonical FAQ content. Every surface pulls from here so answers never
 * diverge between /pricing, /upgrade, /services, and the marketplace.
 */
export const BILLING_FAQ: FAQItem[] = [
  {
    q: 'Which plan should I start with?',
    a: 'Start on the Free Floor — it lets you test the core engines with zero commitment. When you find yourself running the same tool daily, the Playground Suite (₦8,000/$9 per month) removes every limit. Authors and canon readers usually jump straight to Studio Premium (₦4,000/$5), and growth teams start at Signal Pro (₦15,000/$19).',
  },
  {
    q: 'How does billing work — is it naira or dollars?',
    a: 'Both, and you choose at checkout. NGN payments run through Paystack (bank transfer, card, USSD), while USD payments run on global cards. The price you see in your selected currency is the price you pay — no conversion markups, ever.',
  },
  {
    q: 'Can I cancel anytime? What happens to my data?',
    a: 'Yes. Cancel from Account → Premium with one click — no retention calls, no dark patterns. Your drafts, workspace history, and PRIME memory stay intact; you simply drop to the Free Floor entitlements at the end of the billing period.',
  },
  {
    q: 'What exactly do I own after I pay?',
    a: 'Everything you create and everything you buy. Templates ship with a lifetime commercial license for unlimited client projects. Ghostwritten books and co-authored works transfer full copyright to you on final payment. Generated drafts and documents are yours regardless of plan.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Yes. If a template does not boot from its setup guide within 14 days of purchase, we fix it or refund it in full. Subscription plans can be cancelled before renewal for a full refund if you have not consumed paid AI generation beyond the free quota. Custom commission work follows the milestone schedule in the contract — deposits fund completed milestones only.',
  },
  {
    q: 'What is the difference between subscriptions and commissions?',
    a: 'Subscriptions (Playground, Studio Premium, Signal) are self-serve software access — instant, cancel anytime. Commissions (the WRITE/BUILD/VOICE/FRAME services) are done-for-you engagements with a human architect: scoped, milestone-based, and priced per project starting from $750.',
  },
  {
    q: 'Is there a free tier that is actually useful?',
    a: 'Yes — deliberately so. The Free Floor includes daily tries on FORGE, ORACLE, MIRAGE and SENTINEL, the full Book of Lies preview, JadaiHub access, and template browsing. We would rather you build on the floor than trust a demo.',
  },
  {
    q: 'What happens when an AI engine is offline?',
    a: 'Every engine has a four-stage fallback chain: Groq → Gemini → cache → deterministic offline sample. When you see an OFFLINE SAMPLE label, the live model was unreachable, your quota was not consumed, and the sample shows you exactly what output shape to expect. Retry with one click.',
  },
];

export const SERVICES_FAQ: FAQItem[] = [
  {
    q: 'How does an engagement start?',
    a: 'Send a transmission via /contact or book directly through /services. Within 24 hours you receive a scoped proposal: deliverables, milestone schedule, fixed price in your currency, and a plain-language list of what is explicitly out of scope. Work begins after the first milestone payment.',
  },
  {
    q: 'How long does a project take?',
    a: 'A focused audit or voice sprint lands in 1–2 weeks. Full builds run 4–8 weeks depending on surface area. Ghostwriting a full book is 8–12 weeks. Every proposal states the timeline up front, and milestones are billed as they clear — you never prepay the whole project.',
  },
  {
    q: 'Why Jadai instead of a traditional agency?',
    a: 'You work directly with the principal architect — no account managers, no junior handoffs. Every system ships offline-first with real fallback chains, tested RLS policies, and a documented schema. If a vendor integration fails at 3 AM, your product keeps working because we never trusted it to.',
  },
  {
    q: 'Do you work with existing codebases or only greenfield?',
    a: 'Both. Roughly half our work is rescuing systems that drifted — performance audits, schema hardening, RLS reviews, and AI integration into products that already have users. Send the repo or URL and we will tell you honestly whether to refactor or rebuild.',
  },
  {
    q: 'What do you need from me to start?',
    a: 'A clear problem statement, access to the relevant accounts (repo, hosting, domain), and one decision-maker who can answer questions within 24 hours. We handle the rest — including documentation, so nothing lives only in anyone’s head.',
  },
  {
    q: 'Can I pay in naira?',
    a: 'Yes. All services quote in both USD and NGN, settled via Paystack (local cards, transfer, USSD) or international cards. Invoices state the currency you chose at signature.',
  },
];
