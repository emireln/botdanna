// Tests what the coach is told about the writing scores and the words saved for review, and the rules it follows with them.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
let server;
let context;
let rules;

before(async () => {
  server = await createServer({ root, configFile: false, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true, hmr: false } });
  context = await server.ssrLoadModule('/src/lib/coachContext.ts');
  rules = await server.ssrLoadModule('/src/lib/ai.ts');
});

after(async () => {
  await server?.close();
});

const profile = { level: 'B1', goal: 'english', target_score: 100, exam_date: null, exam_name: null };
const cloze = (id, text) => ({ item_key: id, skill: 'language', payload: { question: { id, type: 'cloze', skill: 'language', prompt: 'Fill the gap', text } }, ease: 2.5, interval_days: 0, reps: 0, due_at: '2026-11-01T09:00:00Z' });

test('the writing scores and the saved words are said, before the answers to review', () => {
  const text = context.learnerContext({
    profile,
    skills: {},
    mistakes: [cloze('q1', 'I {{went}} home.')],
    today: '2026-11-23',
    writingScores: [74.4, 70, 62],
    savedWords: ['café', 'Apple'],
  });
  assert.match(text, /Writing checks, newest first, out of 100: 74, 70, 62\./);
  assert.match(text, /Words saved for review \(2 in all\): café, Apple\./);
  assert.ok(text.indexOf('Writing checks') < text.indexOf('Answers to review'), 'the scores come before the answers to review');
  assert.ok(text.indexOf('Words saved') < text.indexOf('Answers to review'), 'the saved words come before the answers to review');
});

test('with no writing scores or saved words, those lines are left out', () => {
  const text = context.learnerContext({ profile, skills: {}, mistakes: [], today: '2026-11-23' });
  assert.doesNotMatch(text, /Writing checks/);
  assert.doesNotMatch(text, /Words saved/);
});

test('a long list of saved words is cut to eight, but the count of all of them is kept', () => {
  const many = Array.from({ length: 10 }, (_, index) => `word${index + 1}`);
  const text = context.learnerContext({ profile, skills: {}, mistakes: [], today: '2026-11-23', savedWords: many });
  assert.match(text, /Words saved for review \(10 in all\): word1, word2, word3, word4, word5, word6, word7, word8\./);
  assert.doesNotMatch(text, /word9/);
});

test('the coach is told not to repeat corrections, to use saved words, and to use the writing scores', () => {
  const system = rules.coachSystem({ level: 'B1', goal: 'english', target_score: 100 });
  assert.match(system, /Do not repeat a correction the learner already saw in this chat/);
  assert.match(system, /use one or two of them in an example or a quick question/);
  assert.match(system, /use them to choose how hard the next text or task should be/);
});
