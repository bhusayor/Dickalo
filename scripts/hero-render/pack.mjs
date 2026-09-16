import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const input = process.argv[2] || '/private/tmp/dickalo-hero-frames';
const output = path.resolve('public/images/hero-construction/v1');
const count = 181;
await fs.mkdir(output, { recursive: true });
const backgroundFile = path.join(input, 'background.png');
const { data: background, info } = await sharp(backgroundFile)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height } = info;
await sharp(backgroundFile).webp({ quality: 88 }).toFile(path.join(output, 'background.webp'));
const manifest = { width, height, frames: [] };
const chunks = [];
let offset = 0;
for (let frame = 0; frame < count; frame++) {
  const filename = path.join(input, `frame-${String(frame).padStart(3, '0')}.png`);
  const image = await sharp(filename).removeAlpha().raw().toBuffer();
  let left = width,
    top = height,
    right = 0,
    bottom = 0;
  const rgba = Buffer.alloc(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel++) {
    const i = pixel * 3;
    const changed =
      image[i] !== background[i] ||
      image[i + 1] !== background[i + 1] ||
      image[i + 2] !== background[i + 2];
    if (!changed) continue;
    const x = pixel % width,
      y = Math.floor(pixel / width);
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x);
    bottom = Math.max(bottom, y);
    rgba[pixel * 4] = image[i];
    rgba[pixel * 4 + 1] = image[i + 1];
    rgba[pixel * 4 + 2] = image[i + 2];
    rgba[pixel * 4 + 3] = 255;
  }
  if (left > right || top > bottom) throw new Error(`Frame ${frame} contains no construction`);
  const region = { left, top, width: right - left + 1, height: bottom - top + 1 };
  const encoded = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .extract(region)
    .webp({ quality: 84, alphaQuality: 100, effort: 5 })
    .toBuffer();
  manifest.frames.push({
    offset,
    length: encoded.length,
    x: left,
    y: top,
    width: region.width,
    height: region.height,
  });
  chunks.push(encoded);
  offset += encoded.length;
  if (frame === 0 || frame === count - 1) {
    await sharp(filename)
      .webp({ quality: 88 })
      .toFile(path.join(output, frame === 0 ? 'foundation.webp' : 'finished.webp'));
  }
}
await fs.writeFile(path.join(output, 'frames.bin'), Buffer.concat(chunks));
await fs.writeFile(path.join(output, 'sequence.json'), JSON.stringify(manifest));
console.log(
  `Packed ${count} frames: ${(offset / 1024 / 1024).toFixed(2)} MiB. Decoded frames are cropped to construction only.`,
);
