export interface BookEpisode {
  id: string;
  number: number;
  title: string;
  theme: string;
  transmission: string;
  readingMinutes: number;
  summary: string;
  status: 'scheduled' | 'in_draft';
}

// Planned canon — the transmission engine publishes these through the 21:47
// delivery cadence. Nothing here is claimed as already transmitted.
export const BOOK_EPISODES: BookEpisode[] = [
  {
    id: 'bol-1',
    number: 1,
    title: 'The Architect and the Borrowed Blueprint',
    theme: 'Origins',
    transmission: '21:47',
    readingMinutes: 7,
    summary:
      'A builder discovers every plan he trusted was signed by someone who never stood on the ground.',
    status: 'in_draft',
  },
  {
    id: 'bol-2',
    number: 2,
    title: 'Salt Contracts',
    theme: 'Deals & Consequences',
    transmission: '21:47',
    readingMinutes: 6,
    summary:
      'What a handshake costs when both parties agree to remember it differently.',
    status: 'scheduled',
  },
  {
    id: 'bol-3',
    number: 3,
    title: 'The Compass That Pointed at the Owner',
    theme: 'Self-Knowledge',
    transmission: '21:47',
    readingMinutes: 5,
    summary:
      'A navigator learns the cruelest direction a needle can take is inward.',
    status: 'scheduled',
  },
  {
    id: 'bol-4',
    number: 4,
    title: 'Inventory of Empty Rooms',
    theme: 'Ambition & Restraint',
    transmission: '21:47',
    readingMinutes: 8,
    summary:
      'A merchant counts what he built and finds the ledger lists only doors.',
    status: 'scheduled',
  },
  {
    id: 'bol-5',
    number: 5,
    title: 'The Honest Mirror',
    theme: 'Truth',
    transmission: '21:47',
    readingMinutes: 6,
    summary:
      'Two rivals keep one mirror between them, and neither likes what it refuses to edit.',
    status: 'in_draft',
  },
  {
    id: 'bol-6',
    number: 6,
    title: 'Stone Patience',
    theme: 'Time',
    transmission: '21:47',
    readingMinutes: 7,
    summary:
      'The quarry answers only those willing to ask the same question for years.',
    status: 'scheduled',
  },
];
