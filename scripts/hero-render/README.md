# Photorealistic construction hero

This is an original architectural concept, not footage or a claim about a completed DICKALO project.

`render.py` builds one detailed house in Blender 4.2 with a fixed camera. Components grow from their
bases in construction order. The published sequence uses Cycles materials for the physical house over
one unchanged photographic Nigerian garden plate (`--native-plate`). This keeps every slab, wall,
window, and reflection attached to the same geometry throughout the scroll. No stage dissolves into
another photograph.

The three source images in `assets/` were made with the built-in imagegen tool. The finish was edited
from the original Blender render with the architecture and camera held in place. The empty plot was
then edited from that finish. Exact generation prompts are recorded in `prompts.json`.

## Reproduce the published sequence

Run from the repository root with Blender 4.2+ (the script selects the local Apple Metal GPU):

```sh
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
"$BLENDER" -b --factory-startup --python scripts/hero-render/render.py -- --native-plate --width 1280 --samples 16 --output /private/tmp/dickalo-hero-frames
"$BLENDER" -b --factory-startup --python scripts/hero-render/render.py -- --native-plate --background-only --width 1280 --output /private/tmp/dickalo-hero-frames
node scripts/hero-render/pack.mjs /private/tmp/dickalo-hero-frames
```

For a single frame use `--preview --progress 0.42`. Rendering is an offline authoring step, not part
of the Next.js/Vercel build. Temporary PNGs and `.blend` files stay outside the repository. All assets
needed in production are in `public/images/hero-construction/v1/`.

`pack.mjs` removes pixels identical to the shared background and crops each frame to the changing
geometry. It stores 181 independent WebP frames in `frames.bin`, with byte ranges and crop positions
in `sequence.json`. The player downloads the compressed sequence once and maintains an 18-frame LRU
bitmap cache. It paints the stable background and one complete construction frame on a single canvas.
Late decodes cannot rewind the visual. Resize only clears the canvas when a replacement is ready.
Reduced-motion and no-JavaScript visitors receive the finished-house still.

The garden plate is designed for this fixed viewpoint. Changing the camera requires regenerating the
background from the new Blender preview. Use a new version directory when replacing published frames
because these files have immutable cache headers.

References: [Blender command-line rendering](https://docs.blender.org/manual/en/4.0/advanced/command_line/arguments.html).
