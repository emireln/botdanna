// Tests the coach's plan for today: which steps the learner's own record calls for, their order, and the limit of three.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
let server;
let plan;

before(async () => {
  server = await createServer({ root, configFile: false, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true, hmr: false } });
  plan = await server.ssrLoadModule('/src/lib/todayPlan.ts');
});

after(async () => {
  await server?.close();
});

const calm = { reviewCount: 0, savedWords: 0, examDays: null, weakest: null, daysSinceWriting: 1 };
const ids = (items) => items.map((item) => item.id);

test('with nothing due, the plan asks the learner to learn some words', () => {
  const steps = plan.todayPlan(calm);
  assert.deepEqual(ids(steps), ['learn']);
  assert.deepEqual(steps[0].action, { kind: 'mode', mode: 'vocabulary' });
});

test('answers to review give a step, and five or more make it urgent', () => {
  const few = plan.todayPlan({ ...calm, reviewCount: 2 });
  assert.deepEqual(ids(few), ['review']);
  assert.equal(few[0].urgent, false);
  assert.equal(few[0].count, 2);
  const many = plan.todayPlan({ ...calm, reviewCount: 5 });
  assert.equal(many[0].urgent, true);
  assert.deepEqual(many[0].action, { kind: 'mode', mode: 'review' });
});

test('an exam within a month gives an exam task, urgent in its last week', () => {
  assert.deepEqual(ids(plan.todayPlan({ ...calm, examDays: 20 })), ['exam']);
  assert.equal(plan.todayPlan({ ...calm, examDays: 5 })[0].urgent, true);
});

test('an exam far away, or already passed, gives no step', () => {
  assert.deepEqual(ids(plan.todayPlan({ ...calm, examDays: 60 })), ['learn']);
  assert.deepEqual(ids(plan.todayPlan({ ...calm, examDays: -2 })), ['learn']);
});

test('a writing check is due after three days, or when there has been none', () => {
  assert.deepEqual(ids(plan.todayPlan({ ...calm, daysSinceWriting: 3 })), ['write']);
  assert.deepEqual(ids(plan.todayPlan({ ...calm, daysSinceWriting: 2 })), ['learn']);
  assert.deepEqual(ids(plan.todayPlan({ ...calm, daysSinceWriting: null })), ['write']);
});

test('the weakest skill, and three or more saved words, each make a step', () => {
  assert.deepEqual(ids(plan.todayPlan({ ...calm, weakest: 'writing', savedWords: 3 })), ['skill', 'words']);
  assert.deepEqual(ids(plan.todayPlan({ ...calm, weakest: 'writing', savedWords: 2 })), ['skill']);
});

test('the plan has at most three steps, and the urgent ones come first', () => {
  const steps = plan.todayPlan({ reviewCount: 6, savedWords: 4, examDays: 3, weakest: 'grammar', daysSinceWriting: null });
  assert.deepEqual(ids(steps), ['review', 'exam', 'write']);
  assert.equal(steps.length, plan.PLAN_LIMIT);
});
