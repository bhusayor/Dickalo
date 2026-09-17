# Duplex virtual-tour authoring

This directory contains the offline authoring pipeline for the DICKALO duplex-tour prototype. The browser receives an optimized GLB and JSON room index; it never parses the IFC at runtime.

## Rebuild

Install IfcOpenShell for Blender's Python into a temporary directory:

```sh
/Applications/Blender.app/Contents/Resources/4.2/python/bin/python3.11 -m pip install \
  --target /private/tmp/dickalo-ifc-python ifcopenshell==0.8.5
```

Then run:

```sh
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup \
  --python scripts/virtual-tour/convert_ifc.py -- \
  --input scripts/virtual-tour/source/Duplex_A_20110907.ifc \
  --output public/models/duplex-tour/duplex.glb \
  --metadata public/models/duplex-tour/rooms.json
```

IfcOpenShell is an authoring dependency only. The generated model is served as a static asset.

Render the website poster after converting the model:

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup \
  --python scripts/virtual-tour/render_preview.py
```
