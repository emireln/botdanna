// Where sign-in returns the person: to a page inside botdanna, never to a sign-in page or to another site.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
let server;
let navigation;

before(async () => {
  server = await createServer({ root, configFile: false, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true, hmr: false } });
  navigation = await server.ssrLoadModule('/src/lib/navigation.ts');
});

after(async () => {
  await server?.close();
});

test('sign-in returns to the page the person asked for, inside botdanna only', () => {
  assert.equal(navigation.returnPath('/library'), '/library');
  assert.equal(navigation.returnPath('/coach/live?mode=talk'), '/coach/live?mode=talk');
  assert.equal(navigation.returnPath('/write#top'), '/write#top');
  assert.equal(navigation.returnPath(undefined), '/');
  assert.equal(navigation.returnPath(''), '/');
  assert.equal(navigation.returnPath('https://evil.example/'), '/');
  assert.equal(navigation.returnPath('//evil.example/'), '/');
  assert.equal(navigation.returnPath('/\\evil'), '/');
  assert.equal(navigation.returnPath('/auth'), '/', 'the sign-in page does not return to itself');
  assert.equal(navigation.returnPath('/welcome?x=1'), '/');
  assert.equal(navigation.returnPath(42), '/');
});
