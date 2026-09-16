import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import {
  constructionFrame,
  coverFrame,
  createFrameCache,
  mountConstructionSequence,
} from '../lib/animations/constructionSequence.ts';

test('scroll progress maps deterministically in both directions and clamps overscroll', () => {
  assert.equal(constructionFrame(0, 181), 0);
  assert.equal(constructionFrame(1, 181), 180);
  assert.equal(constructionFrame(-0.1, 181), 0);
  assert.equal(constructionFrame(1.2, 181), 180);
  assert.equal(constructionFrame(NaN, 181), 0);
  assert.equal(constructionFrame(0.5, 181), 90);
  for (let i = 180; i >= 0; i--) assert.equal(constructionFrame(i / 180, 181), i);
});

test('decoded frames are reused, bounded, and released on unmount', async () => {
  const decoded = [],
    closed = [];
  const cache = createFrameCache(async (index) => {
    decoded.push(index);
    return { index, close: () => closed.push(index) };
  }, 3);
  await Promise.all([cache.load(0), cache.load(0), cache.load(1), cache.load(2)]);
  assert.deepEqual(decoded, [0, 1, 2]);
  assert.equal(cache.get(0).index, 0); // Reverse scrolling makes this frame recent.
  await cache.load(3);
  assert.deepEqual(closed, [1]);
  assert.equal(cache.get(1), undefined);
  assert.equal(cache.get(0).index, 0);
  cache.dispose();
  assert.deepEqual(closed.sort(), [0, 1, 2, 3]);
  assert.equal(await cache.load(4), undefined);
});

test('a pending decode cannot leak a bitmap after route change', async () => {
  let resolve;
  let closes = 0;
  const cache = createFrameCache(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const pending = cache.load(10);
  cache.dispose();
  resolve({ close: () => closes++ });
  assert.equal(await pending, undefined);
  assert.equal(closes, 1);
});

test('failed decodes can retry without poisoning the cache', async () => {
  let attempts = 0;
  const cache = createFrameCache(async () => {
    if (++attempts === 1) throw new Error('decode interrupted');
    return { close() {} };
  });
  await assert.rejects(cache.load(3));
  assert.ok(await cache.load(3));
  cache.dispose();
});

test('responsive framing covers the canvas without exposing empty edges', () => {
  for (const [width, height] of [
    [1440, 900],
    [1024, 768],
    [390, 351],
    [320, 288],
  ]) {
    const frame = coverFrame(width, height, 1280, 720);
    assert.ok(frame.x <= 0 && frame.y <= 0);
    assert.ok(frame.x + frame.width >= width - 1e-6);
    assert.ok(frame.y + frame.height >= height - 1e-6);
    // Both edges of the main building stay inside the mobile media composition.
    if (width < 600) {
      assert.ok(frame.x + frame.width * 0.3 >= 0);
      assert.ok(frame.x + frame.width * 0.84 <= width);
    }
  }
});

test('late decoding never paints an older scroll position over the requested frame', async (t) => {
  const originals = new Map(
    [
      'window',
      'ResizeObserver',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'createImageBitmap',
    ].map((name) => [name, globalThis[name]]),
  );
  t.after(() => {
    for (const [name, value] of originals) {
      if (value === undefined) delete globalThis[name];
      else globalThis[name] = value;
    }
  });
  const callbacks = new Map();
  let serial = 0;
  const waiting = new Map();
  const painted = [];
  globalThis.window = { devicePixelRatio: 1 };
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  globalThis.requestAnimationFrame = (callback) => {
    callbacks.set(++serial, callback);
    return serial;
  };
  globalThis.cancelAnimationFrame = (id) => callbacks.delete(id);
  globalThis.createImageBitmap = async (blob) => {
    const id = new Uint8Array(await blob.arrayBuffer())[0];
    if (id === 1 || id === 2) await new Promise((resolve) => waiting.set(id, resolve));
    return { id, width: 40, height: 40, close() {} };
  };
  const manifest = {
    width: 40,
    height: 40,
    frames: [0, 1, 2].map((offset) => ({ offset, length: 1, x: 0, y: 0, width: 40, height: 40 })),
  };
  t.mock.method(
    globalThis,
    'fetch',
    async (url) =>
      new Response(
        url.endsWith('.json')
          ? JSON.stringify(manifest)
          : new Uint8Array(url.endsWith('.bin') ? [0, 1, 2] : [200]),
      ),
  );
  const sequence = mountConstructionSequence({
    clientWidth: 40,
    clientHeight: 40,
    width: 40,
    height: 40,
    getContext: () => ({
      drawImage: (image) => {
        if (image.id !== 200) painted.push(image.id);
      },
    }),
  });
  t.after(() => sequence.dispose());
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  const tick = async () => {
    const queued = [...callbacks.values()];
    callbacks.clear();
    queued.forEach((callback) => {
      void callback();
    });
    await settle();
  };
  await sequence.prepare();
  assert.deepEqual(painted, [0]);
  sequence.render(0.5);
  await tick();
  sequence.render(1);
  await tick();
  waiting.get(1)();
  await settle();
  await tick();
  waiting.get(2)();
  await settle();
  await tick();
  assert.deepEqual(painted, [0, 2]);
});

test('all published frames have valid bounds and decode independently', async () => {
  const root = new URL('../public/images/hero-construction/v1/', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('sequence.json', root), 'utf8'));
  const data = await readFile(new URL('frames.bin', root));
  assert.equal(manifest.frames.length, 181);
  let offset = 0;
  for (const frame of manifest.frames) {
    assert.equal(frame.offset, offset);
    assert.ok(frame.length > 0);
    assert.ok(frame.x >= 0 && frame.y >= 0);
    assert.ok(frame.x + frame.width <= manifest.width);
    assert.ok(frame.y + frame.height <= manifest.height);
    const image = sharp(data.subarray(frame.offset, frame.offset + frame.length));
    const metadata = await image.metadata();
    assert.equal(metadata.width, frame.width);
    assert.equal(metadata.height, frame.height);
    await image.raw().toBuffer();
    offset += frame.length;
  }
  assert.equal(offset, data.length);
  assert.ok(data.length < 20 * 1024 * 1024, 'sequence exceeds the delivery budget');
});
