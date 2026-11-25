// The coach's plan for today: a few steps that follow from the learner's own record, the answers to review, the words
// saved from the coach, the exam date, the weakest skill and the last writing check. It is worked out from those facts
// alone, so it works without an AI key. Pure functions, so the rules are tested without the screen.
import type { CoachModeId } from './coachModes';
import type { Skill } from './types';

export interface PlanFacts {
  /** The answers to review, saved words included. */
  reviewCount: number;
  /** The words the coach saved for review. */
  savedWords: number;
  /** Whole days to the exam: negative once it has passed, null when no date is set. */
  examDays: number | null;
  /** The lowest skill, or null before a skill has been tested. */
  weakest: Skill | null;
  /** Whole days since the last writing check, or null when there has been none. */
  daysSinceWriting: number | null;
}

export type PlanAction = { kind: 'mode'; mode: CoachModeId } | { kind: 'navigate'; to: string } | { kind: 'skill'; skill: Skill } | { kind: 'words' };

export interface PlanItem {
  id: 'review' | 'exam' | 'write' | 'skill' | 'words' | 'learn';
  action: PlanAction;
  /** How many answers or words the step is about, when it has a count. */
  count: number | null;
  /** An urgent step is shown first. */
  urgent: boolean;
}

export const PLAN_LIMIT = 3;
const EXAM_SOON_DAYS = 30;
const EXAM_URGENT_DAYS = 7;
const REVIEW_URGENT = 5;
const WRITING_EVERY_DAYS = 3;
const WORDS_TO_QUIZ = 3;

/** The steps for today, at most three, urgent ones first. Facts that call for nothing give one step: learn some words. */
export function todayPlan(facts: PlanFacts): PlanItem[] {
  const items: PlanItem[] = [];
  if (facts.reviewCount > 0) {
    items.push({ id: 'review', action: { kind: 'mode', mode: 'review' }, count: facts.reviewCount, urgent: facts.reviewCount >= REVIEW_URGENT });
  }
  if (facts.examDays !== null && facts.examDays >= 0 && facts.examDays <= EXAM_SOON_DAYS) {
    items.push({ id: 'exam', action: { kind: 'mode', mode: 'exam' }, count: null, urgent: facts.examDays <= EXAM_URGENT_DAYS });
  }
  if (facts.daysSinceWriting === null || facts.daysSinceWriting >= WRITING_EVERY_DAYS) {
    items.push({ id: 'write', action: { kind: 'navigate', to: '/write' }, count: null, urgent: false });
  }
  if (facts.weakest) {
    items.push({ id: 'skill', action: { kind: 'skill', skill: facts.weakest }, count: null, urgent: false });
  }
  if (facts.savedWords >= WORDS_TO_QUIZ) {
    items.push({ id: 'words', action: { kind: 'words' }, count: facts.savedWords, urgent: false });
  }
  if (items.length === 0) {
    items.push({ id: 'learn', action: { kind: 'mode', mode: 'vocabulary' }, count: null, urgent: false });
  }
  // Urgent steps first, keeping the order of the rest, and only the first few.
  return [...items.filter((item) => item.urgent), ...items.filter((item) => !item.urgent)].slice(0, PLAN_LIMIT);
}
