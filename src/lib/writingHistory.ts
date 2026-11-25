// The writing checks the learner saved, as scores: the trend on the Write screen, and how long since the last check for
// the coach's plan and context. Pure functions over the saved practice runs.
import { daysBetween } from './coachContext';
import { WRITING_REF } from './writingCheck';
import type { AttemptRow } from './types';

export interface WritingRun {
  /** The score out of 100, rounded. */
  score: number;
  /** When the check was saved, as the database gives it. */
  at: string;
}

/** The writing checks, newest first. Other practice runs are left out. */
export function writingRuns(attempts: readonly AttemptRow[]): WritingRun[] {
  return attempts
    .filter((row) => row.kind === 'practice' && row.ref_id === WRITING_REF)
    .map((row) => ({ score: Math.round(row.score_pct), at: row.created_at }))
    .sort((a, b) => b.at.localeCompare(a.at));
}

/** Whole days from the newest check to the given day (YYYY-MM-DD), or null when there has been no check. */
export function daysSinceWriting(runs: readonly WritingRun[], today: string): number | null {
  if (runs.length === 0) return null;
  return daysBetween(runs[0].at.slice(0, 10), today);
}
