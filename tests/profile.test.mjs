// The size of a banner: it is kept the same everywhere, 480 KB, which is the file limit of the profile-banners bucket.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

test('a banner is kept at the same size everywhere: 480 KB, the file limit of the profile-banners bucket', async () => {
  const server = await createServer({ root, configFile: false, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true, hmr: false } });
  try {
    const rules = await server.ssrLoadModule('/src/lib/data/rules.ts');
    assert.equal(rules.BANNER_MAX_BYTES, 480 * 1024);
    assert.equal(rules.BANNER_MAX_BYTES, 491520);
  } finally {
    await server.close();
  }
});
