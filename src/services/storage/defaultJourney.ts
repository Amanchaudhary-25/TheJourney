import { Journey, Memory, Milestone } from '../../types';

export const DEFAULT_JOURNEY_ID = 'default-journey-2022';

export const DEFAULT_JOURNEY: Journey = {
  id: DEFAULT_JOURNEY_ID,
  title: 'The Journey',
  subtitle: 'The journey began here.',
  mode: 'since',
  startDate: '2022-12-18T00:00:00.000Z',
  endDate: null,
  hasStartTime: false,
  description: 'The day everything began.',
  quote: 'We together fulfill our dreams, promises and what we have thought of.',
  theme: 'minimal',
  createdAt: '2022-12-18T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_MEMORIES: Memory[] = [
  {
    id: 'mem-beginning',
    journeyId: DEFAULT_JOURNEY_ID,
    date: '2022-12-18T00:00:00.000Z',
    title: 'The Beginning',
    description: 'The moment the path opened and every thought found its direction.',
    location: 'Where it all started',
    tags: ['Origin', 'Promise'],
    symbol: '✦',
    createdAt: '2022-12-18T00:00:00.000Z',
  },
  {
    id: 'mem-first-chapter',
    journeyId: DEFAULT_JOURNEY_ID,
    date: '2023-02-14T00:00:00.000Z',
    title: 'First Horizon',
    description: 'Looking forward into the months ahead with certainty and shared wonder.',
    location: 'Under the open sky',
    tags: ['Memory', 'Growth'],
    symbol: '♥',
    createdAt: '2023-02-14T00:00:00.000Z',
  },
  {
    id: 'mem-another-chapter',
    journeyId: DEFAULT_JOURNEY_ID,
    date: '2024-08-20T00:00:00.000Z',
    title: 'Another Chapter',
    description: 'Stepping into a new year of growth, fulfilling what we set out to build.',
    location: 'On the road',
    tags: ['Milestone', 'Dream'],
    symbol: '◈',
    createdAt: '2024-08-20T00:00:00.000Z',
  },
];

export const DEFAULT_CUSTOM_MILESTONES: Milestone[] = [
  {
    id: 'mile-1000',
    journeyId: DEFAULT_JOURNEY_ID,
    days: 1000,
    label: '1,000 Days',
    notes: 'A thousand sunrises since the journey began.'
  },
  {
    id: 'mile-1500',
    journeyId: DEFAULT_JOURNEY_ID,
    days: 1500,
    label: '1,500 Days',
    notes: 'Approaching four full orbits around the sun.'
  }
];
