import { ElapsedTime, JourneyMode, Milestone } from '../types';

/**
 * Calculates calendar-aware time difference between two dates.
 * Properly handles leap years, month lengths (28, 29, 30, 31),
 * end-of-month rollovers, and time zones.
 */
export function calculateElapsedTime(
  startDateStr: string,
  endDateStr?: string | null,
  mode: JourneyMode = 'since',
  now: Date = new Date()
): ElapsedTime {
  const startDate = new Date(startDateStr);
  let targetDate: Date;

  if (mode === 'between') {
    targetDate = endDateStr ? new Date(endDateStr) : now;
  } else if (mode === 'until') {
    targetDate = startDate; // Target is in the future
  } else {
    // mode === 'since'
    targetDate = now;
  }

  // Determine chronological earlier and later dates
  let t1: Date;
  let t2: Date;
  let isPast = true;

  if (mode === 'until') {
    if (targetDate.getTime() > now.getTime()) {
      t1 = now;
      t2 = targetDate;
      isPast = false; // Counting down
    } else {
      // Reached or passed target
      t1 = targetDate;
      t2 = now;
      isPast = true;
    }
  } else if (mode === 'between') {
    if (startDate.getTime() <= targetDate.getTime()) {
      t1 = startDate;
      t2 = targetDate;
      isPast = true;
    } else {
      t1 = targetDate;
      t2 = startDate;
      isPast = false;
    }
  } else {
    // 'since'
    if (startDate.getTime() <= now.getTime()) {
      t1 = startDate;
      t2 = now;
      isPast = true;
    } else {
      // Future date selected in since mode
      t1 = now;
      t2 = startDate;
      isPast = false;
    }
  }

  // Total milliseconds difference
  const totalDiffMs = Math.max(0, t2.getTime() - t1.getTime());
  const totalSeconds = Math.floor(totalDiffMs / 1000);
  const totalMinutes = Math.floor(totalDiffMs / (1000 * 60));
  const totalHours = Math.floor(totalDiffMs / (1000 * 60 * 60));
  const totalDays = Math.floor(totalDiffMs / (1000 * 60 * 60 * 24));

  // Calendar-aware calculation
  // 1. Calculate full years
  let years = t2.getFullYear() - t1.getFullYear();
  let cursor = new Date(t1.getTime());
  cursor.setFullYear(t1.getFullYear() + years);

  // If cursor overshot t2, back up one year
  if (cursor.getTime() > t2.getTime()) {
    years--;
    cursor = new Date(t1.getTime());
    cursor.setFullYear(t1.getFullYear() + years);
  }

  // 2. Calculate full months
  let months = 0;
  while (true) {
    const nextCursor = addMonthsPrecise(cursor, 1);
    if (nextCursor.getTime() <= t2.getTime()) {
      months++;
      cursor = nextCursor;
    } else {
      break;
    }
  }

  // 3. Remaining time from cursor to t2 in days, hours, minutes, seconds
  let remainingMs = t2.getTime() - cursor.getTime();

  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  remainingMs -= days * 24 * 60 * 60 * 1000;

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  remainingMs -= hours * 60 * 60 * 1000;

  const minutes = Math.floor(remainingMs / (1000 * 60));
  remainingMs -= minutes * 60 * 1000;

  const seconds = Math.floor(remainingMs / 1000);

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
    isPast,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
  };
}

/**
 * Add months accurately taking into account variable month lengths and leap years.
 */
function addMonthsPrecise(date: Date, monthsToAdd: number): Date {
  const result = new Date(date.getTime());
  const expectedMonth = (result.getMonth() + monthsToAdd) % 12;
  result.setMonth(result.getMonth() + monthsToAdd);

  // If month rolled over unexpectedly (e.g. adding 1 month to Jan 31 gives Mar 2 or 3 in Feb),
  // set to last day of previous month
  if (result.getMonth() !== expectedMonth) {
    result.setDate(0); // Sets to last day of previous month
  }
  return result;
}

/**
 * Formats a date into "18 December 2022" or with time if requested
 */
export function formatDisplayDate(dateStr: string, includeTime = false): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Invalid date';

    const day = d.getDate();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    if (!includeTime) {
      return `${day} ${month} ${year}`;
    }

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} at ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

/**
 * Standard milestone definitions and calculations
 */
export const DEFAULT_MILESTONE_DAYS = [
  { days: 100, label: '100 Days' },
  { days: 365, label: '1 Year (365 Days)' },
  { days: 500, label: '500 Days' },
  { days: 730, label: '2 Years' },
  { days: 1000, label: '1,000 Days' },
  { days: 1095, label: '3 Years' },
  { days: 1500, label: '1,500 Days' },
  { days: 1825, label: '5 Years' },
  { days: 2000, label: '2,000 Days' },
  { days: 2500, label: '2,500 Days' },
  { days: 3000, label: '3,000 Days' },
  { days: 3650, label: '10 Years' },
  { days: 5000, label: '5,000 Days' },
];

export interface MilestoneProgress {
  currentDays: number;
  nextMilestone: {
    days: number;
    label: string;
    daysRemaining: number;
    targetDate: string;
  } | null;
  previousMilestone: {
    days: number;
    label: string;
  } | null;
  progressPercent: number;
}

export function calculateMilestoneProgress(
  startDateStr: string,
  customMilestones: Milestone[] = [],
  now: Date = new Date(),
  includeDefaultMilestones = true
): MilestoneProgress {
  const startDate = new Date(startDateStr);
  const diffMs = Math.max(0, now.getTime() - startDate.getTime());
  const currentDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Built-in milestones belong only to the seeded journey; custom journeys start empty.
  const allMilestoneDays = [
    ...(includeDefaultMilestones ? DEFAULT_MILESTONE_DAYS : []),
    ...customMilestones.map(m => ({ days: m.days, label: m.label }))
  ].sort((a, b) => a.days - b.days);

  // Remove duplicates
  const uniqueMilestones = allMilestoneDays.filter(
    (item, index, self) => index === self.findIndex(t => t.days === item.days)
  );

  let next = null;
  let prev = null;

  for (let i = 0; i < uniqueMilestones.length; i++) {
    if (uniqueMilestones[i].days > currentDays) {
      const target = uniqueMilestones[i];
      const targetDate = new Date(startDate.getTime() + target.days * 24 * 60 * 60 * 1000);
      next = {
        days: target.days,
        label: target.label,
        daysRemaining: target.days - currentDays,
        targetDate: formatDisplayDate(targetDate.toISOString())
      };
      prev = i > 0 ? uniqueMilestones[i - 1] : { days: 0, label: 'The Beginning' };
      break;
    }
  }

  let progressPercent = 0;
  if (next && prev) {
    const range = next.days - prev.days;
    const completed = currentDays - prev.days;
    progressPercent = Math.min(100, Math.max(0, Math.round((completed / range) * 100)));
  } else if (!next && uniqueMilestones.length > 0) {
    progressPercent = 100;
  }

  return {
    currentDays,
    nextMilestone: next,
    previousMilestone: prev,
    progressPercent
  };
}

/**
 * Validate dates for mode constraints
 */
export function validateJourneyDates(
  mode: JourneyMode,
  startDateStr: string,
  endDateStr?: string | null
): { valid: boolean; error?: string } {
  if (!startDateStr) {
    return { valid: false, error: 'Please choose a date.' };
  }

  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) {
    return { valid: false, error: 'Invalid date format.' };
  }

  const now = new Date();

  if (mode === 'since') {
    if (start.getTime() > now.getTime()) {
      return {
        valid: false,
        error: 'Choose a moment that has already happened for a "Since" journey.'
      };
    }
  } else if (mode === 'until') {
    if (start.getTime() <= now.getTime()) {
      return {
        valid: false,
        error: 'That moment has already arrived. Please choose a future date for "Until" mode.'
      };
    }
  } else if (mode === 'between') {
    if (!endDateStr) {
      return { valid: false, error: 'Please choose an end date.' };
    }
    const end = new Date(endDateStr);
    if (isNaN(end.getTime())) {
      return { valid: false, error: 'Invalid end date format.' };
    }
    if (end.getTime() < start.getTime()) {
      return { valid: false, error: 'The end date cannot be earlier than the start date.' };
    }
  }

  return { valid: true };
}
