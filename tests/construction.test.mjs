import assert from 'node:assert/strict';
import test from 'node:test';
import { PerspectiveCamera, Vector3 } from 'three';
import {
  createConstructionModel,
  frameConstructionCamera,
  createConstructionFrames,
} from '../lib/animations/constructionScene.ts';

test('preparation and refresh never expose intermediate construction frames', () => {
  const pending = new Map();
  const drawn = [];
  let id = 0;
  const frames = createConstructionFrames(
    (progress) => drawn.push(progress),
    (callback) => {
      pending.set(++id, callback);
      return id;
    },
    (frame) => pending.delete(frame),
  );
  frames.update(0);
  frames.update(0.6); // Scroll restored while shaders are still preparing.
  assert.equal(pending.size, 0);
  assert.deepEqual(drawn, []);
  frames.start();
  assert.deepEqual(drawn, [0.6]);
  frames.update(0); // Temporary GSAP refresh/reset state.
  frames.redraw(); // Resize notification in the same frame.
  frames.update(0.62);
  assert.equal(pending.size, 1);
  [...pending.values()][0]();
  assert.deepEqual(drawn, [0.6, 0.62]);
  frames.update(0.4); // Reverse scroll remains supported.
  [...pending.values()][0]();
  assert.deepEqual(drawn, [0.6, 0.62, 0.4]);
  frames.update(1);
  frames.dispose();
  frames.start();
  frames.update(0);
  assert.equal(pending.size, 0);
  assert.deepEqual(drawn, [0.6, 0.62, 0.4]);
});

test('the same parts build monotonically and remain anchored to their bases', (t) => {
  const model = createConstructionModel();
  t.after(() => model.dispose());
  const identities = model.parts.map(({ object }) => object.uuid);
  let previousVisible = 0;
  for (let step = 0; step <= 100; step++) {
    model.setProgress(step / 100);
    assert.deepEqual(
      model.parts.map(({ object }) => object.uuid),
      identities,
    );
    const visible = model.parts.filter(({ object }) => object.visible).length;
    assert.ok(visible >= previousVisible);
    previousVisible = visible;
    for (const part of model.parts) {
      if (part.axis === 'all') {
        assert.ok(part.object.position.distanceTo(part.position) < 1e-9);
      } else {
        const initialBase = part.position[part.axis] - part.scale[part.axis] / 2;
        const currentBase = part.object.position[part.axis] - part.object.scale[part.axis] / 2;
        assert.ok(Math.abs(initialBase - currentBase) < 1e-9, 'construction base drifted');
      }
      for (const dimension of ['x', 'y', 'z']) {
        assert.ok(Number.isFinite(part.object.scale[dimension]));
        assert.ok(part.object.scale[dimension] >= 0);
      }
    }
  }
  assert.equal(previousVisible, model.parts.length);
});

test('the full house fits the camera on desktop and narrow portrait screens', () => {
  for (const [width, height] of [
    [1440, 900],
    [1024, 768],
    [768, 1024],
    [390, 844],
    [320, 740],
  ]) {
    const camera = new PerspectiveCamera(38, 1, 0.1, 160);
    frameConstructionCamera(camera, width, height);
    for (const x of [-6, 8])
      for (const y of [0, 8])
        for (const z of [-5, 3]) {
          const screen = new Vector3(x, y, z).project(camera);
          assert.ok(
            Math.abs(screen.x) < 1 && Math.abs(screen.y) < 1,
            `house cropped at ${width}x${height}`,
          );
        }
  }
});

test('reverse scrolling restores the exact geometry, with no frame swaps or fading materials', (t) => {
  const model = createConstructionModel();
  t.after(() => model.dispose());
  const snapshot = () =>
    model.parts.map(({ object }) => ({
      id: object.uuid,
      position: object.position.toArray(),
      scale: object.scale.toArray(),
      visible: object.visible,
    }));
  model.setProgress(0.43);
  const halfway = snapshot();
  model.setProgress(1);
  model.setProgress(0.43);
  assert.deepEqual(snapshot(), halfway);
  model.setProgress(-1);
  assert.equal(model.parts.filter(({ object }) => object.visible).length, 0);
  model.setProgress(2);
  assert.equal(model.parts.filter(({ object }) => object.visible).length, model.parts.length);
  model.scene.traverse((object) => {
    if (object.isMesh) {
      assert.equal(object.material.opacity, 1);
      assert.equal(object.material.transparent, false);
    }
  });
});
