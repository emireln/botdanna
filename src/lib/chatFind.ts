// Find in this chat: the messages that hold the words typed, in the order they come, and the next or previous one from
// where the learner is. It reads what the learner sees: the text of a reply and its vocabulary cards, not the block
// markers around them. Accents and capitals do not matter. Pure functions.
import { parseCoachReply } from './coachReply';

export interface FindRow {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/** The words of a message as the learner reads them. */
export function visibleText(row: FindRow): string {
  if (row.role === 'user') return row.content;
  return parseCoachReply(row.content)
    .flatMap((part) => {
      if (part.kind === 'text') return [part.text];
      if (part.kind === 'vocab') return part.items.flatMap((item) => [item.word, item.meaning, item.example]);
      return [];
    })
    .join('\n');
}

/** Lower case, without accents, with single spaces: the form two texts are compared in. */
const fold = (text: string): string => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** The ids of the messages that hold the text, in the order they come. An empty search holds nothing. */
export function findMatches(rows: readonly FindRow[], query: string): string[] {
  const needle = fold(query);
  if (!needle) return [];
  return rows.filter((row) => fold(visibleText(row)).includes(needle)).map((row) => row.id);
}

/** The index of the match one step away, wrapping at the ends. With no matches, -1. */
export function stepMatch(current: number, count: number, step: 1 | -1): number {
  if (count === 0) return -1;
  if (current < 0 || current >= count) return step === 1 ? 0 : count - 1;
  return (current + step + count) % count;
}
