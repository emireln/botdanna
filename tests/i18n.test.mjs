// The Brazilian Portuguese translation. Every string the code passes to t() or tn() has a translation, the
// placeholders ({count} and the like) match in both languages, and the translation runs in the right language.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const root = fileURLToPath(new URL('..', import.meta.url));
let server;
let i18n;
let PT;

before(async () => {
  server = await createServer({ root, configFile: false, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true, hmr: false } });
  i18n = await server.ssrLoadModule('/src/lib/i18n/index.ts');
  ({ PT } = await server.ssrLoadModule('/src/lib/i18n/pt/index.ts'));
});

after(async () => {
  await server?.close();
});

async function sourceFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (path.replace(/\\/g, '/').endsWith('/lib/i18n/pt')) continue;
      found.push(...(await sourceFiles(path)));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      found.push(path);
    }
  }
  return found;
}

// The string literal as the code writes it: single or double quotes, with \' and \\ escapes.
const LITERAL = String.raw`'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"`;

function unescape(text) {
  return text.replace(/\\(.)/g, '$1');
}

async function codeStrings() {
  const keys = new Set();
  for (const file of await sourceFiles(join(root, 'src'))) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(new RegExp(String.raw`(?<![\w$.])t\(\s*(?:${LITERAL})`, 'g'))) {
      keys.add(unescape(match[1] ?? match[2]));
    }
    for (const match of source.matchAll(new RegExp(String.raw`(?<![\w$.])tn\(\s*(?:${LITERAL})\s*,\s*(?:${LITERAL})`, 'g'))) {
      keys.add(unescape(match[1] ?? match[2]));
      keys.add(unescape(match[3] ?? match[4]));
    }
  }
  return [...keys];
}

const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',');

test('every string in the code has a Portuguese translation', async () => {
  const keys = await codeStrings();
  assert.ok(keys.length > 50, 'the scan should find the interface strings');
  const missing = keys.filter((key) => !Object.hasOwn(PT, key));
  assert.deepEqual(missing, [], `no Portuguese translation for: ${missing.slice(0, 20).join(' | ')}`);
});

test('translations are filled in and keep their placeholders', () => {
  for (const [key, value] of Object.entries(PT)) {
    assert.ok(value.trim().length > 0, `empty translation for "${key}"`);
    assert.equal(placeholders(value), placeholders(key), `placeholders differ for "${key}"`);
  }
});

test('the language follows the setting and the text changes with it', () => {
  i18n.setLang('en');
  assert.equal(i18n.t('Save'), 'Save');
  assert.equal(i18n.t('Friends, {count} waiting', { count: 2 }), 'Friends, 2 waiting');
  i18n.setLang('pt');
  assert.equal(i18n.getLocale(), 'pt-BR');
  assert.equal(i18n.t('Friends, {count} waiting', { count: 2 }), 'Amigos, 2 aguardando');
  assert.equal(i18n.t('What does “hello” mean?'), 'O que significa “hello”?');
  assert.equal(i18n.t('Text nobody translated'), 'Text nobody translated');
  i18n.setLang('en');
});

test('plural forms follow the count in both languages', () => {
  i18n.setLang('pt');
  assert.equal(i18n.tn('{count} lesson', '{count} lessons', 1, { count: 1 }), '1 lição');
  assert.equal(i18n.tn('{count} lesson', '{count} lessons', 3, { count: 3 }), '3 lições');
  i18n.setLang('en');
  assert.equal(i18n.tn('{count} lesson', '{count} lessons', 1, { count: 1 }), '1 lesson');
  assert.equal(i18n.tn('{count} lesson', '{count} lessons', 0, { count: 0 }), '0 lessons');
});

test('the desktop shell follows the app language, else the system language', () => {
  const requireCjs = createRequire(import.meta.url);
  const shell = requireCjs(join(root, 'electron', 'i18n.cjs'));
  assert.equal(shell.shellLanguage('pt', 'en-US'), 'pt');
  assert.equal(shell.shellLanguage('en', 'pt-BR'), 'en');
  assert.equal(shell.shellLanguage(null, 'pt-BR'), 'pt');
  assert.equal(shell.shellLanguage(null, 'fr-FR'), 'en');
  assert.equal(shell.shellLanguage(undefined, undefined), 'en');
  for (const language of ['en', 'pt']) {
    for (const key of ['open', 'coach', 'live', 'write', 'quit', 'hint']) assert.ok(shell.shellText(language)[key], `${language}.${key}`);
  }
  assert.notEqual(shell.shellText('pt').quit, shell.shellText('en').quit);
});
