// Tests the saved words read back from the review items: the word, its meaning and example, and which items are left out.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
let server;
let words;

before(async () => {
  server = await createServer({ root, configFile: false, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true, hmr: false } });
  words = await server.ssrLoadModule('/src/lib/savedWords.ts');
});

after(async () => {
  await server?.close();
});

// A saved word, as the coach's vocabulary card becomes a review item: its example with the word in a gap.
const saved = (word, example, meaning) => ({
  item_key: `coach-vocab:${word.toLowerCase()}`,
  skill: 'language',
  payload: { question: { id: `coach-vocab:${word.toLowerCase()}`, type: 'cloze', skill: 'language', prompt: 'Fill in the gap', text: example.replace(word, `{{${word}}}`), explanation: meaning } },
  ease: 2.5,
  interval_days: 0,
  reps: 0,
  due_at: '2026-11-01T09:00:00Z',
});

test('each saved word has its meaning and its example, with the word in place', () => {
  assert.deepEqual(words.savedWords([saved('café', 'I drink a café each morning.', 'coffee shop')]), [
    { word: 'café', meaning: 'coffee shop', example: 'I drink a café each morning.' },
  ]);
});

test('the words are in alphabetical order, whatever their capitals', () => {
  const list = words.savedWords([saved('zebra', 'The zebra runs.', 'a striped animal'), saved('Apple', 'I ate an Apple today.', 'a fruit'), saved('café', 'A café opens.', 'a coffee shop')]);
  assert.deepEqual(
    list.map((item) => item.word),
    ['Apple', 'café', 'zebra'],
  );
});

test('other review items are left out, including a word whose example has no gap', () => {
  const choice = { item_key: 'lesson-3:q2', skill: 'language', payload: { question: { id: 'q2', type: 'choice', skill: 'language', prompt: 'Pick one', options: ['a', 'b'], answer: 0 } }, ease: 2.5, interval_days: 0, reps: 0, due_at: '2026-11-01T09:00:00Z' };
  const noGap = { ...saved('run', 'We run daily.', 'to move fast'), payload: { question: { id: 'x', type: 'cloze', skill: 'language', prompt: 'Fill in the gap', text: 'We run daily.' } } };
  assert.deepEqual(words.savedWords([choice, noGap]), []);
});

test('a missing meaning is an empty string, not a missing field', () => {
  const [word] = words.savedWords([saved('quick', 'A quick reply helps.', undefined)]);
  assert.equal(word.meaning, '');
});
