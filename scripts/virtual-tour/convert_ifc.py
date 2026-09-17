"""Convert the licensed buildingSMART duplex IFC into a web-ready GLB.

Run with Blender 4.2+:
  blender -b --factory-startup --python scripts/virtual-tour/convert_ifc.py -- \
    --input scripts/virtual-tour/source/Duplex_A_20110907.ifc \
    --output public/models/duplex-tour/duplex.glb \
    --metadata public/models/duplex-tour/rooms.json

IfcOpenShell is an offline authoring dependency. It is intentionally not part
of the Next.js runtime or the production dependency tree.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
from pathlib import Path

import bpy


ROOT = Path(__file__).resolve().parents[2]


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--metadata", required=True)
    parser.add_argument(
        "--ifcopenshell-path",
        default="/private/tmp/dickalo-ifc-python",
        help="Directory containing the temporary IfcOpenShell Python package.",
    )
    return parser.parse_args(sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else [])


args = arguments()
sys.path.append(args.ifcopenshell_path)

import ifcopenshell  # noqa: E402
import ifcopenshell.geom  # noqa: E402


SOURCE = (ROOT / args.input).resolve() if not Path(args.input).is_absolute() else Path(args.input)
OUTPUT = (ROOT / args.output).resolve() if not Path(args.output).is_absolute() else Path(args.output)
METADATA = (
    (ROOT / args.metadata).resolve() if not Path(args.metadata).is_absolute() else Path(args.metadata)
)
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
METADATA.parent.mkdir(parents=True, exist_ok=True)


def clean_name(value: str | None) -> str:
    return re.sub(r"[^A-Za-z0-9 ._:-]+", " ", value or "").strip()


def colour(hex_value: str) -> tuple[float, float, float, float]:
    value = hex_value.lstrip("#")
    return tuple(int(value[index : index + 2], 16) / 255 for index in (0, 2, 4)) + (1.0,)


def material(name: str, base: str, roughness: float, metallic: float = 0.0, alpha: float = 1.0):
    item = bpy.data.materials.new(name)
    item.diffuse_color = (*colour(base)[:3], alpha)
    item.use_nodes = True
    shader = item.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*colour(base)[:3], alpha)
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = metallic
    if alpha < 1:
        shader.inputs["Alpha"].default_value = alpha
        shader.inputs["Transmission Weight"].default_value = max(0.0, 1 - alpha)
        shader.inputs["IOR"].default_value = 1.45
        item.surface_render_method = "DITHERED"
        item.use_transparency_overlap = False
    return item


def category(entity) -> str:
    if entity.is_a("IfcWindow"):
        return "glass"
    if entity.is_a("IfcDoor"):
        return "door"
    if entity.is_a("IfcRoof"):
        return "roof"
    if entity.is_a("IfcStair") or entity.is_a("IfcStairFlight"):
        return "stair"
    if entity.is_a("IfcSlab"):
        return "slab"
    if entity.is_a("IfcRailing"):
        return "metal"
    if entity.is_a("IfcFurnishingElement"):
        return "furniture"
    if entity.is_a("IfcWall"):
        name = (entity.Name or "").lower()
        return "exterior" if any(word in name for word in ("exterior", "brick", "foundation")) else "wall"
    return "structure"


def storey_for(entity) -> str | None:
    for relation in getattr(entity, "ContainedInStructure", ()) or ():
        container = relation.RelatingStructure
        if container and container.is_a("IfcBuildingStorey"):
            return container.GlobalId
    for relation in getattr(entity, "Decomposes", ()) or ():
        container = relation.RelatingObject
        if container and container.is_a("IfcBuildingStorey"):
            return container.GlobalId
    return None


def triples(values) -> list[tuple[float, float, float]]:
    return [tuple(values[index : index + 3]) for index in range(0, len(values), 3)]


def bounds(vertices: list[tuple[float, float, float]]) -> dict[str, list[float]]:
    return {
        "min": [min(point[axis] for point in vertices) for axis in range(3)],
        "max": [max(point[axis] for point in vertices) for axis in range(3)],
    }


def to_three(point: list[float] | tuple[float, float, float]) -> list[float]:
    # Blender exports Z-up scenes to glTF's Y-up coordinate system.
    return [round(point[0], 4), round(point[2], 4), round(-point[1], 4)]


def to_three_bounds(
    minimum: list[float] | tuple[float, float, float],
    maximum: list[float] | tuple[float, float, float],
) -> dict[str, list[float]]:
    """Convert a Blender AABB to glTF axes and restore ordered minima/maxima."""
    converted = [to_three(minimum), to_three(maximum)]
    return {
        "min": [min(point[axis] for point in converted) for axis in range(3)],
        "max": [max(point[axis] for point in converted) for axis in range(3)],
    }


bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for block in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
    if block is bpy.data.materials:
        continue
    for item in list(block):
        block.remove(item)

materials = {
    "exterior": material("Warm exterior render", "D8C7A7", 0.72),
    "wall": material("Soft interior plaster", "E9E4D8", 0.86),
    "slab": material("Honed limestone floors", "C9B99A", 0.58),
    "stair": material("Stone staircase", "BBA98C", 0.52),
    "roof": material("Dark roof membrane", "493D34", 0.8),
    "door": material("Iroko doors", "7C5436", 0.5),
    "glass": material("Architectural glazing", "91B3B5", 0.12, metallic=0.08, alpha=0.3),
    "metal": material("Graphite metalwork", "343733", 0.32, metallic=0.72),
    "furniture": material("Warm neutral furniture", "A88E72", 0.68),
    "structure": material("Structural concrete", "A7A39A", 0.82),
}

ifc = ifcopenshell.open(str(SOURCE))
settings = ifcopenshell.geom.settings()
settings.set(settings.USE_WORLD_COORDS, True)
settings.set(settings.WELD_VERTICES, True)

records = []
all_vertices: list[tuple[float, float, float]] = []
accepted = (
    "IfcBuildingElement",
    "IfcFurnishingElement",
    "IfcTransportElement",
    "IfcElementAssembly",
)
for entity in ifc.by_type("IfcProduct"):
    if entity.is_a("IfcSpace") or not entity.Representation:
        continue
    if not any(entity.is_a(kind) for kind in accepted):
        continue
    try:
        shape = ifcopenshell.geom.create_shape(settings, entity)
    except Exception as error:
        print(f"DICKALO_IFC_SKIP {entity.is_a()} {entity.GlobalId}: {error}")
        continue
    vertices = triples(list(shape.geometry.verts))
    faces = triples(list(shape.geometry.faces))
    if not vertices or not faces:
        continue
    all_vertices.extend(vertices)
    records.append((entity, vertices, faces))

if not records:
    raise RuntimeError("The IFC did not produce any web geometry")

model_bounds = bounds(all_vertices)
offset = [
    -(model_bounds["min"][0] + model_bounds["max"][0]) / 2,
    -(model_bounds["min"][1] + model_bounds["max"][1]) / 2,
    -model_bounds["min"][2],
]

collection = bpy.data.collections.new("Duplex virtual tour")
bpy.context.scene.collection.children.link(collection)

for entity, source_vertices, faces in records:
    vertices = [
        (point[0] + offset[0], point[1] + offset[1], point[2] + offset[2])
        for point in source_vertices
    ]
    label = clean_name(entity.Name) or entity.is_a()
    object_name = f"{entity.is_a()}__{entity.GlobalId}__{label}"[:120]
    mesh = bpy.data.meshes.new(object_name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update(calc_edges=False)
    obj = bpy.data.objects.new(object_name, mesh)
    collection.objects.link(obj)
    obj.data.materials.append(materials[category(entity)])
    obj["ifcGuid"] = entity.GlobalId
    obj["ifcType"] = entity.is_a()
    obj["ifcName"] = label
    obj["storey"] = storey_for(entity) or ""

rooms = []
space_vertices = []
for space in ifc.by_type("IfcSpace"):
    if not space.Representation:
        continue
    try:
        shape = ifcopenshell.geom.create_shape(settings, space)
    except Exception:
        continue
    vertices = triples(list(shape.geometry.verts))
    if not vertices:
        continue
    box = bounds(vertices)
    shifted_min = [box["min"][axis] + offset[axis] for axis in range(3)]
    shifted_max = [box["max"][axis] + offset[axis] for axis in range(3)]
    center = [(shifted_min[axis] + shifted_max[axis]) / 2 for axis in range(3)]
    center[2] = shifted_min[2] + 1.65
    code = clean_name(space.Name)
    room_name = clean_name(getattr(space, "LongName", None)) or code or "Room"
    if room_name == "Room" and code.endswith("105"):
        room_name = "Stair"
    unit = code[0] if code and code[0] in ("A", "B") else "Shared"
    storey = storey_for(space)
    rooms.append(
        {
            "id": space.GlobalId,
            "code": code,
            "name": room_name,
            "unit": unit,
            "storey": storey,
            "position": to_three(center),
            "bounds": to_three_bounds(shifted_min, shifted_max),
        }
    )
    space_vertices.extend(vertices)

storeys = []
for storey in sorted(
    ifc.by_type("IfcBuildingStorey"), key=lambda item: float(item.Elevation or 0)
):
    elevation = float(storey.Elevation or 0) + offset[2]
    storeys.append(
        {
            "id": storey.GlobalId,
            "name": clean_name(storey.Name),
            "elevation": round(elevation, 4),
            "cameraHeight": round(elevation + 1.65, 4),
        }
    )

scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.length_unit = "METERS"
scene.world.color = (0.025, 0.035, 0.028)

for obj in collection.objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = next(iter(collection.objects))

bpy.ops.export_scene.gltf(
    filepath=str(OUTPUT),
    export_format="GLB",
    export_yup=True,
    export_apply=True,
    export_cameras=False,
    export_lights=False,
    export_extras=True,
    export_materials="EXPORT",
)

shifted_model_min = [model_bounds["min"][axis] + offset[axis] for axis in range(3)]
shifted_model_max = [model_bounds["max"][axis] + offset[axis] for axis in range(3)]
payload = {
    "model": "/models/duplex-tour/duplex.glb",
    "title": "Duplex Apartment virtual-tour study",
    "source": "BSI (2020) Duplex Apartment Test Files, buildingSMART International",
    "sourceUrl": "https://github.com/buildingsmart-community/Community-Sample-Test-Files/tree/main/IFC%202.3.0.1%20(IFC%202x3)/Duplex%20Apartment",
    "license": "CC BY 4.0",
    "changes": "Converted from IFC to GLB; web materials, centering, navigation metadata and presentation were added by DICKALO.",
    "bounds": to_three_bounds(shifted_model_min, shifted_model_max),
    "storeys": storeys,
    "rooms": rooms,
}
METADATA.write_text(json.dumps(payload, indent=2), encoding="utf-8")
print(
    f"DICKALO_IFC_COMPLETE objects={len(records)} rooms={len(rooms)} "
    f"glb={OUTPUT.stat().st_size / 1024 / 1024:.2f}MiB"
)
