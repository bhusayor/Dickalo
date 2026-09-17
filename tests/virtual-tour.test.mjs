import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const metadataPath = new URL('../public/models/duplex-tour/rooms.json', import.meta.url);
const modelPath = new URL('../public/models/duplex-tour/duplex.glb', import.meta.url);

test('duplex model is a valid GLB with useful room navigation', async () => {
  const [metadata, model] = await Promise.all([
    readFile(metadataPath, 'utf8').then(JSON.parse),
    readFile(modelPath),
  ]);

  assert.equal(model.subarray(0, 4).toString('utf8'), 'glTF');
  assert.ok(model.byteLength > 1_000_000, 'model should contain the complete building geometry');
  assert.equal(metadata.rooms.length, 21);
  assert.deepEqual(
    metadata.storeys
      .filter((storey) => ['Level 1', 'Level 2'].includes(storey.name))
      .map((storey) => storey.name),
    ['Level 1', 'Level 2'],
  );

  for (const room of metadata.rooms) {
    assert.equal(room.position.length, 3);
    assert.ok(room.position.every(Number.isFinite));
    assert.ok(room.bounds.min.every((value, index) => value <= room.bounds.max[index]));
  }

  const roomNames = new Set(metadata.rooms.map((room) => room.name));
  for (const expected of ['Foyer', 'Living Room', 'Kitchen', 'Bedroom 1', 'Bathroom 2', 'Stair']) {
    assert.ok(roomNames.has(expected), `missing ${expected}`);
  }
  assert.equal(metadata.license, 'CC BY 4.0');
  assert.match(metadata.source, /buildingSMART International/);
});
