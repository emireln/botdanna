// Tests the tab layout: where the tabs sit is the choice of this device, kept under its own key in local storage. Anything
// that is not "top" keeps the tabs at the bottom, and nothing else is written.
import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
let server;
let prefs;
let store;
const realWindow = globalThis.window;

before(async () => {
  server = await createServer({ root, configFile: false, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true, hmr: false } });
  prefs = await server.ssrLoadModule('/src/lib/preferences.ts');
});

after(async () => {
  await server?.close();
  globalThis.window = realWindow;
});

beforeEach(() => {
  store = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
    },
  };
});

test('with nothing saved, the tabs stay at the bottom', () => {
  assert.equal(prefs.readTabLayout(), 'bottom');
});

test('the title bar choice is read back on this device, and can be changed again', () => {
  prefs.writeTabLayout('top');
  assert.equal(prefs.readTabLayout(), 'top');
  prefs.writeTabLayout('bottom');
  assert.equal(prefs.readTabLayout(), 'bottom');
});

test('a value that is not a known layout keeps the tabs at the bottom', () => {
  store.set('botdanna.tabs', 'sideways');
  assert.equal(prefs.readTabLayout(), 'bottom');
});

test('the choice is kept under one local key, so it never goes into the profile or the account', () => {
  prefs.writeTabLayout('top');
  assert.deepEqual([...store.keys()], ['botdanna.tabs']);
});

test('without storage (no window, as in a server), the tabs stay at the bottom and nothing breaks', () => {
  globalThis.window = undefined;
  assert.equal(prefs.readTabLayout(), 'bottom');
  assert.doesNotThrow(() => prefs.writeTabLayout('top'));
});
