// Tests the writing history: the checks kept newest first, the other practice runs left out, and the days since the last check.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
let server;
let history;

before(async () => {
  server = await createServer({ root, configFile: false, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true, hmr: false } });
  history = await server.ssrLoadModule('/src/lib/writingHistory.ts');
});

after(async () => {
  await server?.close();
});

const attempt = (ref_id, score_pct, created_at, kind = 'practice') => ({ id: created_at, user_id: 'me', kind, ref_id, title: 'Run', score_pct, predicted: null, skills: {}, answers: [], duration_s: 0, xp: 0, created_at });

test('the writing checks are kept, newest first, and other practice runs are left out', () => {
  const runs = history.writingRuns([
    attempt('writing-check', 62.4, '2026-11-10T10:00:00Z'),
    attempt('grammar-drill', 90, '2026-11-12T10:00:00Z'),
    attempt('writing-check', 74, '2026-11-20T10:00:00Z'),
    attempt('writing-check', 50, '2026-11-01T10:00:00Z', 'exam'),
  ]);
  assert.deepEqual(
    runs.map((run) => run.score),
    [74, 62],
  );
});

test('the days since the newest check are counted from its day', () => {
  const runs = history.writingRuns([attempt('writing-check', 74, '2026-11-20T10:00:00Z')]);
  assert.equal(history.daysSinceWriting(runs, '2026-11-23'), 3);
});

test('with no check there is no day count', () => {
  assert.equal(history.daysSinceWriting([], '2026-11-23'), null);
});
