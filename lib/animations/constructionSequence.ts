export type SequenceManifest = {
  width: number;
  height: number;
  frames: { offset: number; length: number; x: number; y: number; width: number; height: number }[];
};

export const SEQUENCE_ROOT = '/images/hero-construction/v1';

export function constructionFrame(progress: number, count: number) {
  const value = Number.isFinite(progress) ? progress : 0;
  return Math.round(Math.max(0, Math.min(1, value)) * Math.max(0, count - 1));
}

export function coverFrame(
  width: number,
  height: number,
  sourceWidth: number,
  sourceHeight: number,
) {
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawnWidth = sourceWidth * scale;
  const drawnHeight = sourceHeight * scale;
  return {
    x: (width - drawnWidth) * 0.66,
    y: (height - drawnHeight) * 0.5,
    width: drawnWidth,
    height: drawnHeight,
  };
}

/** An LRU of decoded frames keeps mobile memory bounded; compressed frames share one request. */
export function createFrameCache<T extends { close(): void }>(
  decode: (index: number) => Promise<T>,
  capacity = 18,
) {
  const cache = new Map<number, T>();
  const pending = new Map<number, Promise<T | undefined>>();
  let disposed = false;
  return {
    get(index: number) {
      const frame = cache.get(index);
      if (frame) {
        cache.delete(index);
        cache.set(index, frame);
      }
      return frame;
    },
    load(index: number): Promise<T | undefined> {
      if (disposed) return Promise.resolve(undefined);
      const existing = cache.get(index);
      if (existing) return Promise.resolve(existing);
      const loading = pending.get(index);
      if (loading) return loading;
      const promise = decode(index)
        .then((frame) => {
          if (disposed) {
            frame.close();
            return undefined;
          }
          cache.set(index, frame);
          while (cache.size > capacity) {
            const oldest = cache.keys().next().value!;
            cache.get(oldest)?.close();
            cache.delete(oldest);
          }
          return frame;
        })
        .finally(() => pending.delete(index));
      pending.set(index, promise);
      return promise;
    },
    dispose() {
      disposed = true;
      cache.forEach((frame) => frame.close());
      cache.clear();
    },
  };
}

export function mountConstructionSequence(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('Canvas unavailable');
  const abort = new AbortController();
  let manifest: SequenceManifest;
  let source: Blob;
  let background: ImageBitmap | undefined;
  let disposed = false;
  let prepared = false;
  let progress = 0;
  let desired = 0;
  let painted = -1;
  let raf: number | undefined;
  let resizing = true;
  let decoding = false;
  let prefetching = false;
  const cache = createFrameCache(async (index) => {
    const frame = manifest.frames[index];
    return createImageBitmap(source.slice(frame.offset, frame.offset + frame.length, 'image/webp'));
  });

  function paint(index: number) {
    const image = cache.get(index);
    if (!image || disposed) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    // A new bitmap is already decoded before touching the visible canvas.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    if (!background) return;
    const rect = coverFrame(pixelWidth, pixelHeight, manifest.width, manifest.height);
    const region = manifest.frames[index];
    const scale = rect.width / manifest.width;
    context!.drawImage(background, rect.x, rect.y, rect.width, rect.height);
    context!.drawImage(
      image,
      rect.x + region.x * scale,
      rect.y + region.y * scale,
      region.width * scale,
      region.height * scale,
    );
    painted = index;
    resizing = false;
  }

  async function draw() {
    raf = undefined;
    if (disposed || !prepared) return;
    desired = constructionFrame(progress, manifest.frames.length);
    if (cache.get(desired)) {
      if (painted !== desired || resizing) paint(desired);
    } else if (!decoding) {
      decoding = true;
      const target = desired;
      try {
        await cache.load(target);
        // A late decode must never replace a newer scroll position.
        if (!disposed && target === constructionFrame(progress, manifest.frames.length))
          paint(target);
      } catch {
        // Keep the last complete frame visible if one decode fails.
      } finally {
        decoding = false;
        if (!disposed && target !== constructionFrame(progress, manifest.frames.length)) schedule();
      }
    }
    // One prefetch worker, at most two decodes at a time. A fast scroll must
    // not queue hundreds of obsolete decodes behind the requested frame.
    if (!prefetching && !disposed) {
      prefetching = true;
      const target = constructionFrame(progress, manifest.frames.length);
      try {
        for (let distance = 1; distance <= 4; distance++) {
          if (disposed || target !== constructionFrame(progress, manifest.frames.length)) break;
          await Promise.all(
            [target + distance, target - distance]
              .filter((index) => index >= 0 && index < manifest.frames.length)
              .map((index) => cache.load(index).catch(() => undefined)),
          );
        }
      } finally {
        prefetching = false;
      }
    }
  }

  function schedule() {
    if (prepared && !disposed && raf === undefined) raf = requestAnimationFrame(draw);
  }

  const observer = new ResizeObserver(() => {
    resizing = true;
    schedule();
  });
  observer.observe(canvas);

  return {
    async prepare() {
      const options = { signal: abort.signal };
      const [indexResponse, framesResponse, backgroundResponse] = await Promise.all([
        fetch(`${SEQUENCE_ROOT}/sequence.json`, options),
        fetch(`${SEQUENCE_ROOT}/frames.bin`, options),
        fetch(`${SEQUENCE_ROOT}/background.webp`, options),
      ]);
      if (!indexResponse.ok || !framesResponse.ok || !backgroundResponse.ok)
        throw new Error('Construction sequence unavailable');
      [manifest, source] = await Promise.all([indexResponse.json(), framesResponse.blob()]);
      if (!manifest.frames.length) throw new Error('Construction sequence empty');
      const decodedBackground = await createImageBitmap(await backgroundResponse.blob());
      if (disposed) {
        decodedBackground.close();
        return;
      }
      background = decodedBackground;
      // Scroll can change during loading. Reveal only the latest requested stage.
      let index: number;
      do {
        index = constructionFrame(progress, manifest.frames.length);
        await cache.load(index);
      } while (!disposed && index !== constructionFrame(progress, manifest.frames.length));
      if (disposed) return;
      prepared = true;
      paint(index);
      schedule();
    },
    render(value: number) {
      progress = value;
      schedule();
    },
    dispose() {
      disposed = true;
      abort.abort();
      observer.disconnect();
      if (raf !== undefined) cancelAnimationFrame(raf);
      cache.dispose();
      background?.close();
    },
  };
}
