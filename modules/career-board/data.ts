export interface CareerMission {
  id: string;
  title: string;
  org: string;
  type: 'Full-time' | 'Contract';
  mode: 'Remote' | 'Hybrid';
  compBand: string;
  stack: string[];
  status: 'preview' | 'pipeline';
}

// Pipeline preview — the board goes live with the JadaiHub public launch.
// Nothing here is an active posting yet.
export const CAREER_MISSIONS: CareerMission[] = [
  {
    id: 'cb-1',
    title: 'Senior Platform Engineer',
    org: 'Jadai Studios (internal)',
    type: 'Full-time',
    mode: 'Remote',
    compBand: '₦450K – ₦700K / month',
    stack: ['Node.js', 'TypeScript', 'PostgreSQL', 'Cloudflare'],
    status: 'pipeline',
  },
  {
    id: 'cb-2',
    title: 'AI Integration Engineer',
    org: 'Partner — YC-backed SaaS',
    type: 'Contract',
    mode: 'Remote',
    compBand: '$2.8K – $4K / month',
    stack: ['OpenAI API', 'RAG', 'Python', 'Vector DBs'],
    status: 'preview',
  },
  {
    id: 'cb-3',
    title: 'Product Designer (Systems)',
    org: 'Partner — Fintech, Lagos',
    type: 'Full-time',
    mode: 'Hybrid',
    compBand: '₦550K – ₦850K / month',
    stack: ['Figma', 'Design Systems', 'Prototyping'],
    status: 'preview',
  },
  {
    id: 'cb-4',
    title: 'Frontend Engineer, Design Tooling',
    org: 'Partner — Remote-first Studio',
    type: 'Contract',
    mode: 'Remote',
    compBand: '$2K – $3.2K / month',
    stack: ['React', 'Canvas APIs', 'WebGL'],
    status: 'preview',
  },
  {
    id: 'cb-5',
    title: 'DevRel & Technical Writer',
    org: 'Partner — API Infrastructure',
    type: 'Full-time',
    mode: 'Remote',
    compBand: '$2.2K – $3K / month',
    stack: ['Developer Docs', 'MDX', 'OpenAPI'],
    status: 'pipeline',
  },
  {
    id: 'cb-6',
    title: 'Data Engineer (Pipelines)',
    org: 'Partner — Logistics, East Africa',
    type: 'Contract',
    mode: 'Remote',
    compBand: '$2.5K – $3.6K / month',
    stack: ['dbt', 'Airflow', 'BigQuery'],
    status: 'preview',
  },
];
