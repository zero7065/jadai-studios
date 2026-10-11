// Deterministic growth strategy builder — runs fully offline (client or server).

export interface GrowthInput {
  product: string;
  audience: string;
  stage: 'idea' | 'launch' | 'scale';
  budget: 'zero' | 'lean' | 'funded';
  channels: string[];
}

export interface GrowthPillar {
  name: string;
  focus: string;
  tactics: string[];
  kpis: string[];
}

export interface GrowthWeek {
  week: number;
  focus: string;
  actions: string[];
}

export interface ChannelRow {
  channel: string;
  priority: 1 | 2 | 3;
  effort: 'Low' | 'Medium' | 'High';
  cost: string;
}

export interface GrowthPlan {
  product: string;
  audience: string;
  stage: GrowthInput['stage'];
  budget: GrowthInput['budget'];
  pillars: GrowthPillar[];
  weeks: GrowthWeek[];
  channels: ChannelRow[];
  risks: string[];
}

const CHANNEL_CATALOG: Record<string, { effort: ChannelRow['effort']; zeroCost: string; fundedCost: string }> = {
  SEO: { effort: 'Medium', zeroCost: 'Content + long-tail pages', fundedCost: 'Content team + Ahrefs' },
  'Paid Ads': { effort: 'High', zeroCost: 'Not viable at zero budget', fundedCost: '$1.5k–5k/mo Meta+Google' },
  'Product-Led': { effort: 'Medium', zeroCost: 'Free tier + referral loop', fundedCost: 'In-product onboarding + lifecycle email' },
  'Social Organic': { effort: 'Low', zeroCost: 'Daily founder posts', fundedCost: 'Creator partnerships' },
  'Email': { effort: 'Low', zeroCost: 'Free tier up to 1k subs', fundedCost: 'Automated lifecycle flows' },
  'Community': { effort: 'Medium', zeroCost: 'Discord/Telegram + office hours', fundedCost: 'Community manager' },
  Partnerships: { effort: 'Medium', zeroCost: 'Direct outreach, rev-share', fundedCost: 'Affiliate program + co-marketing' },
  'Direct Sales': { effort: 'High', zeroCost: 'Founder-led outbound', fundedCost: 'SDR + CRM stack' },
};

function stagePillars(stage: GrowthInput['stage'], product: string, audience: string): GrowthPillar[] {
  if (stage === 'idea') {
    return [
      {
        name: 'Validation before code',
        focus: `Confirm ${audience} will pay for ${product}.`,
        tactics: [
          'Run 10 problem interviews (ask about last time they hit this pain, not opinions).',
          'Build a one-page waitlist with the core promise — 100 signups = signal.',
          'Pre-sell: ask for a refundable deposit before the first line of code.',
          'Map the top 3 alternatives your audience already uses and their loudest complaint.',
        ],
        kpis: ['10 interviews completed', '100 waitlist signups', '5+ deposits or LOIs'],
      },
      {
        name: 'Positioning wedge',
        focus: 'Own one sharp sentence before owning a market.',
        tactics: [
          'Write the "for X who Y, we are the only Z" line and test 3 variants.',
          'Collect 5 verbatim quotes of the pain — reuse them as copy.',
          'Publish a teardown of the status quo as the first public artifact.',
        ],
        kpis: ['1 positioning line >40% click-through', '5 pain quotes captured'],
      },
      {
        name: 'Founder channel fit',
        focus: 'Find the one channel you can sustain weekly.',
        tactics: [
          'Post daily where your audience already gathers (2 platforms max).',
          'Comment meaningfully on 20 posts/day in the niche for 14 days.',
          'Ship one public build-in-public update per week.',
        ],
        kpis: ['28 days consistent output', 'First 100 organic followers', '1 inbound conversation/day'],
      },
    ];
  }
  if (stage === 'launch') {
    return [
      {
        name: 'Launch ignition',
        focus: `Convert the waitlist into ${product}'s first paying cohort.`,
        tactics: [
          'Staged launch: 48h to waitlist, then public, then directories.',
          'Sequence 5 onboarding emails: promise, proof, quick win, case study, offer.',
          'Offer a founding-member price with a hard expiry (72h).',
          'Line up 3 launch-week mentions (communities, newsletters, partners).',
        ],
        kpis: ['20% waitlist → signup', '3% waitlist → paid', '5 partner mentions'],
      },
      {
        name: 'Activation & retention',
        focus: 'Make the first session produce a visible win.',
        tactics: [
          'Instrument onboarding: find where 40%+ of users drop and cut that step.',
          'Trigger one "aha" action in-session (first result, first import, first share).',
          'Email non-active users at 24h/72h with a single next action.',
        ],
        kpis: ['>50% activation rate', 'D7 retention >30%', '<40% onboarding drop-off'],
      },
      {
        name: 'Proof engine',
        focus: 'Turn early users into public evidence.',
        tactics: [
          'Collect 3 testimonials with numbers within 14 days of first results.',
          'Publish one case study: before, mechanism, after.',
          'Show live usage (counter, wall of love) on the pricing page.',
        ],
        kpis: ['3 quantified testimonials', '1 published case study'],
      },
    ];
  }
  return [
    {
      name: 'Efficient acquisition',
      focus: `Scale what already converts for ${product} — kill what doesn't.`,
      tactics: [
        'Double down on the single best-converting channel; cap the others.',
        'Raise prices 15–20% and measure churn delta over 30 days.',
        'Build an always-on referral loop with a symmetric incentive.',
        'Localize or verticalize the offer for your second-best segment.',
      ],
      kpis: ['CAC down 20% QoQ', 'Referral share >15% of signups', 'NRR >100%'],
    },
    {
      name: 'Expansion revenue',
      focus: 'Grow inside the accounts you already won.',
      tactics: [
        'Ship one usage-based or seat-based upgrade path.',
        'Quarterly value review for top 10 accounts — surface expansion triggers.',
        'Build an integration that embeds you into the customer’s daily tool.',
      ],
      kpis: ['Expansion MRR >20% of new MRR', 'Top-10 account retention 100%'],
    },
    {
      name: 'Moat compounding',
      focus: 'Make the product harder to replace each month.',
      tactics: [
        'Convert your best workflows into templates/exports users build on.',
        'Ship data lock-in ethically: history, analytics, and automations users accumulate.',
        'Publish category-defining content your competitors can’t copy verbatim.',
      ],
      kpis: ['Feature adoption >60% on core', 'Churn < monthly cohort growth'],
    },
  ];
}

function stageWeeks(stage: GrowthInput['stage'], product: string, audience: string): GrowthWeek[] {
  if (stage === 'idea') {
    return [
      { week: 1, focus: 'Interview sprint', actions: ['Book 10 interviews with ' + audience, 'Run 5 interviews using problem-first script', 'Log verbatim pain quotes'] },
      { week: 2, focus: 'Positioning test', actions: ['Publish one-page promise', 'Test 3 headline variants', 'Instrument waitlist source tracking'] },
      { week: 3, focus: 'Channel probe', actions: ['Daily presence on 2 channels', '20 niche comments/day', 'First build-in-public post'] },
      { week: 4, focus: 'Pre-sell decision', actions: ['Ask top 5 interviewees for deposits', 'Score: 5+ yes = build, else pivot', 'Write validation memo'] },
    ];
  }
  if (stage === 'launch') {
    return [
      { week: 1, focus: 'Warm launch', actions: ['Email full waitlist', 'Open founding-member pricing', 'Personally onboard first 20 users'] },
      { week: 2, focus: 'Public launch', actions: ['Public announcement', '3 community posts', '2 newsletter/partner mentions'] },
      { week: 3, focus: 'Fix activation', actions: ['Watch 10 session recordings', 'Cut biggest drop-off step', 'Ship 24h re-engagement email'] },
      { week: 4, focus: 'Proof & iterate', actions: ['Collect 3 quantified testimonials', 'Publish first case study', 'Decide price increase for next cohort'] },
    ];
  }
  return [
    { week: 1, focus: 'Channel audit', actions: ['Pull CAC + conversion by channel', 'Pause bottom quartile', 'Rebudget top channel'] },
    { week: 2, focus: 'Pricing move', actions: ['Raise price 15% for new signups', 'Notify existing accounts with 30-day grandfather', 'Prep churn-save offer'] },
    { week: 3, focus: 'Expansion push', actions: ['Ship one upgrade path', 'Run value reviews with top 10 accounts', 'Launch referral incentive'] },
    { week: 4, focus: 'Compounding', actions: ['Publish category content piece', 'Template/pack of best workflows', 'Write monthly growth memo'] },
  ];
}

function channelMatrix(input: GrowthInput): ChannelRow[] {
  const requested = input.channels.length > 0 ? input.channels : ['Social Organic', 'SEO'];
  const rows: ChannelRow[] = [];
  requested.forEach((name, idx) => {
    const catalog = CHANNEL_CATALOG[name];
    if (!catalog) return;
    rows.push({
      channel: name,
      priority: (idx < 2 ? 1 : idx < 4 ? 2 : 3) as 1 | 2 | 3,
      effort: catalog.effort,
      cost: input.budget === 'zero' ? catalog.zeroCost : catalog.fundedCost,
    });
  });
  if (rows.length === 0) {
    rows.push({ channel: 'Social Organic', priority: 1, effort: 'Low', cost: 'Daily founder posts' });
  }
  return rows;
}

function stageRisks(input: GrowthInput): string[] {
  const base = [
    'Building before validating — interviews and pre-sells must come first.',
    'Spreading across too many channels — depth beats coverage at every stage.',
  ];
  if (input.stage === 'launch') base.push('Launching to an empty list — warm the waitlist for at least 2 weeks beforehand.');
  if (input.budget === 'zero') base.push('Paid acquisition is out of reach — commit to organic cadence or stall.');
  if (input.budget === 'funded') base.push('Paid spend without activation data burns cash — fix onboarding before scaling ads.');
  if (input.stage === 'scale') base.push('Premature pricing drops train buyers to wait — raise, don’t discount.');
  return base;
}

export function buildGrowthPlan(input: GrowthInput): GrowthPlan {
  const product = (input.product || '').trim() || 'your product';
  const audience = (input.audience || '').trim() || 'your audience';

  return {
    product,
    audience,
    stage: input.stage,
    budget: input.budget,
    pillars: stagePillars(input.stage, product, audience),
    weeks: stageWeeks(input.stage, product, audience),
    channels: channelMatrix(input),
    risks: stageRisks(input),
  };
}
