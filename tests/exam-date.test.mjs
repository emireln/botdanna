// The exam date of the learner: a paused exam shows no date, the date itself is kept, and the date reads as the day it is.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
let server;
let exam;

before(async () => {
  server = await createServer({ root, configFile: false, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true, hmr: false } });
  exam = await server.ssrLoadModule('/src/lib/exam.ts');
});

after(async () => {
  await server?.close();
});

test('a paused exam shows no date, and the date itself is kept', () => {
  assert.equal(exam.activeExamDate({ exam_date: '2026-12-01', exam_paused: false }), '2026-12-01');
  assert.equal(exam.activeExamDate({ exam_date: '2026-12-01', exam_paused: true }), null);
  assert.equal(exam.activeExamDate({ exam_date: null, exam_paused: false }), null);
  assert.equal(exam.activeExamDate(null), null);
});

test('the exam date reads as the day it is, whatever the time zone', () => {
  const text = exam.examDateText('2026-12-01');
  assert.match(text, /2026/);
  assert.match(text, /\b1\b/);
  assert.doesNotMatch(text, /November|\b30\b/, 'the day does not shift to the day before');
});
