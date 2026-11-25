// The words the coach saved for review, read back from the review items: each word with its meaning and its example,
// with the word in place. The review items are the learner's own record, so nothing is changed here. Pure functions.
import type { ReviewRow } from './types';

export const SAVED_WORD_PREFIX = 'coach-vocab:';

export interface SavedWord {
  word: string;
  /** The meaning as the coach gave it, in the learner's language. Empty when none was kept. */
  meaning: string;
  /** The example sentence, with the word in it. */
  example: string;
}

/** The saved words in alphabetical order. A review item that is not a saved word is left out. */
export function savedWords(rows: readonly ReviewRow[]): SavedWord[] {
  const words: SavedWord[] = [];
  for (const row of rows) {
    if (!row.item_key.startsWith(SAVED_WORD_PREFIX)) continue;
    const question = row.payload.question;
    if (question.type !== 'cloze') continue;
    const gap = /\{\{([^{}]+)\}\}/.exec(question.text);
    if (!gap) continue;
    words.push({
      word: gap[1],
      meaning: question.explanation ?? '',
      example: question.text.replace(/\{\{([^{}]+)\}\}/g, '$1'),
    });
  }
  return words.sort((a, b) => a.word.localeCompare(b.word, 'en', { sensitivity: 'base' }));
}
