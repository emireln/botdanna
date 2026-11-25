// What the coach knows about the learner, as a few plain lines for the model: the level and goal, the exam and how
// many days are left, the skill scores, the writing checks, the words saved for review and the answers the learner got
// wrong. Only learning facts go here: no name,
// no email, no account details. Pure functions, so the rules are tested without the screen.
import { clozeAnswers } from './grading';
import { SKILLS, type Goal, type Level, type ReviewRow, type Skill } from './types';

export interface LearnerFacts {
  profile: { level: Level; goal: Goal; target_score: number; exam_date: string | null; exam_name: string | null };
  /** The latest score in each skill, out of 100. */
  skills: Partial<Record<Skill, number>>;
  /** The answers to review, newest first. */
  mistakes: ReviewRow[];
  /** Today as YYYY-MM-DD, so the days to the exam are counted from the same day as the screen. */
  today: string;
  /** The scores of the latest writing checks, out of 100, newest first. Optional: the context works without them. */
  writingScores?: number[];
  /** The words the coach saved for review, in alphabetical order. Optional. */
  savedWords?: string[];
}

const MAX_CONTEXT = 1400;
const MAX_MISTAKES = 6;
const MAX_WRITING = 5;
const MAX_SAVED = 8;
const MAX_TEXT = 110;

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

/** A review item in a few words: the sentence with its gap, or the question, and its right answer. */
export function describeMistake(row: ReviewRow): string {
  const question = row.payload.question;
  if (question.type === 'cloze') {
    const gapped = question.text.replace(/\{\{[^{}]+\}\}/g, '___');
    return `"${clip(gapped, MAX_TEXT)}" (answer: ${clozeAnswers(question.text).join(', ')})`;
  }
  if (question.type === 'choice') return `"${clip(question.prompt, MAX_TEXT)}" (answer: ${question.options[question.answer]})`;
  if (question.type === 'reorder') return `"${clip(question.answer, MAX_TEXT)}"`;
  return `"${clip(question.prompt, MAX_TEXT)}"`;
}

/** Whole days from one YYYY-MM-DD day to another: positive when the second comes later. */
export function daysBetween(from: string, to: string): number {
  const start = new Date(`${from}T00:00:00`).getTime();
  const end = new Date(`${to}T00:00:00`).getTime();
  return Math.round((end - start) / 86_400_000);
}

/** The learner's facts for the model, in a few lines, never longer than the limit. Empty facts give the level and goal only. */
export function learnerContext(facts: LearnerFacts): string {
  const { profile, skills, mistakes, today } = facts;
  const lines: string[] = [];
  const goal = profile.goal === 'toefl' ? `the TOEFL iBT, target score ${profile.target_score} of 120` : 'general English';
  lines.push(`- Level ${profile.level}. Studying for ${goal}.`);

  if (profile.exam_date) {
    const name = profile.exam_name ? `"${clip(profile.exam_name, 60)}", ` : '';
    const days = daysBetween(today, profile.exam_date);
    const when = days > 0 ? `${days} days from today` : days === 0 ? 'today' : 'already passed';
    lines.push(`- Exam: ${name}on ${profile.exam_date} (${when}).`);
  }

  const scored = SKILLS.filter((skill) => typeof skills[skill] === 'number');
  if (scored.length > 0) {
    const scores = scored.map((skill) => `${skill} ${Math.round(skills[skill] ?? 0)}`).join(', ');
    const weakest = scored.reduce((low, skill) => ((skills[skill] ?? 0) < (skills[low] ?? 0) ? skill : low), scored[0]);
    lines.push(`- Skill scores out of 100: ${scores}. Weakest: ${weakest}.`);
  }

  // The writing scores and the saved words come before the answers to review, so a long list cannot push them out.
  const writing = facts.writingScores ?? [];
  if (writing.length > 0) {
    lines.push(`- Writing checks, newest first, out of 100: ${writing.slice(0, MAX_WRITING).map((score) => Math.round(score)).join(', ')}.`);
  }

  const saved = facts.savedWords ?? [];
  if (saved.length > 0) {
    lines.push(`- Words saved for review (${saved.length} in all): ${saved.slice(0, MAX_SAVED).map((word) => clip(word, 40)).join(', ')}.`);
  }

  if (mistakes.length > 0) {
    lines.push(`- Answers to review, newest first: ${mistakes.slice(0, MAX_MISTAKES).map(describeMistake).join('; ')}.`);
  }

  const text = [
    'About this learner. Use it to choose examples, to notice patterns in their mistakes and to say when something they worked on comes back. Do not recite it.',
    ...lines,
  ].join('\n');
  return text.length > MAX_CONTEXT ? `${text.slice(0, MAX_CONTEXT - 1)}…` : text;
}
