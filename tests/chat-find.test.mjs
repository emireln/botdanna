// Tests find in this chat: which messages hold the words typed, accents and capitals aside, and the next or previous match.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
let server;
let find;

before(async () => {
  server = await createServer({ root, configFile: false, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true, hmr: false } });
  find = await server.ssrLoadModule('/src/lib/chatFind.ts');
});

after(async () => {
  await server?.close();
});

const rows = [
  { id: 'a', role: 'user', content: 'Tell me about the Café' },
  { id: 'b', role: 'assistant', content: 'Coffee is a drink.' },
  { id: 'c', role: 'user', content: 'cafe is spelled with an accent' },
];

test('a search finds the messages that hold it, whatever the accents and capitals', () => {
  assert.deepEqual(find.findMatches(rows, 'CAFE'), ['a', 'c']);
  assert.deepEqual(find.findMatches(rows, 'café'), ['a', 'c']);
});

test('the matches come in the order of the chat', () => {
  assert.deepEqual(find.findMatches(rows, 'a'), ['a', 'b', 'c']);
});

test('an empty or blank search finds nothing', () => {
  assert.deepEqual(find.findMatches(rows, ''), []);
  assert.deepEqual(find.findMatches(rows, '   '), []);
});

test('a reply is searched by its text', () => {
  assert.deepEqual(find.findMatches(rows, 'coffee is a drink'), ['b']);
});

test('the next and previous match wrap at the ends of the list', () => {
  assert.equal(find.stepMatch(0, 3, 1), 1);
  assert.equal(find.stepMatch(2, 3, 1), 0);
  assert.equal(find.stepMatch(0, 3, -1), 2);
  assert.equal(find.stepMatch(-1, 3, 1), 0);
  assert.equal(find.stepMatch(0, 0, 1), -1);
});
