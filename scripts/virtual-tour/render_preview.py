"""Render the converted duplex GLB as a website poster.

Run with Blender 4.2+:
  blender -b --factory-startup --python scripts/virtual-tour/render_preview.py
"""

from pathlib import Path
import math

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
MODEL = ROOT / "public/models/duplex-tour/duplex.glb"
OUTPUT = ROOT / "public/images/tour/duplex-preview.webp"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(MODEL))

for obj in bpy.context.scene.objects:
    if obj.type == "MESH":
        obj.select_set(False)

ground_material = bpy.data.materials.new("Garden lawn")
ground_material.diffuse_color = (0.055, 0.13, 0.065, 1.0)
ground_material.use_nodes = True
ground_shader = ground_material.node_tree.nodes.get("Principled BSDF")
ground_shader.inputs["Base Color"].default_value = (0.055, 0.13, 0.065, 1.0)
ground_shader.inputs["Roughness"].default_value = 0.93

bpy.ops.mesh.primitive_plane_add(size=90, location=(0, 0, -0.035))
ground = bpy.context.object
ground.name = "Preview garden lawn"
ground.data.materials.append(ground_material)

world = bpy.context.scene.world
world.use_nodes = True
world_nodes = world.node_tree.nodes
world_nodes.clear()
sky = world_nodes.new("ShaderNodeTexSky")
sky.sky_type = "NISHITA"
sky.sun_elevation = math.radians(24)
sky.sun_rotation = math.radians(138)
sky.air_density = 1.1
background = world_nodes.new("ShaderNodeBackground")
background.inputs["Strength"].default_value = 0.18
output = world_nodes.new("ShaderNodeOutputWorld")
world.node_tree.links.new(sky.outputs["Color"], background.inputs["Color"])
world.node_tree.links.new(background.outputs["Background"], output.inputs["Surface"])

bpy.ops.object.light_add(type="SUN", location=(8, -10, 16))
sun = bpy.context.object
sun.rotation_euler = (math.radians(28), math.radians(-18), math.radians(132))
sun.data.energy = 1.8
sun.data.angle = math.radians(8)

bpy.ops.object.light_add(type="AREA", location=(-8, -12, 10))
fill = bpy.context.object
fill.data.energy = 520
fill.data.shape = "DISK"
fill.data.size = 8
fill.data.color = (0.78, 0.9, 1.0)

camera_data = bpy.data.cameras.new("Duplex preview camera")
camera = bpy.data.objects.new("Duplex preview camera", camera_data)
bpy.context.scene.collection.objects.link(camera)
camera.location = (25.5, -38.0, 17.0)
target = Vector((0, 0.0, 3.3))
camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()
camera.data.lens = 58
bpy.context.scene.camera = camera

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE_NEXT"
scene.render.resolution_x = 1600
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "WEBP"
scene.render.image_settings.color_mode = "RGB"
scene.render.image_settings.color_depth = "8"
scene.render.image_settings.quality = 90
scene.render.filepath = str(OUTPUT)
scene.render.film_transparent = False
scene.render.image_settings.color_management = "FOLLOW_SCENE"
scene.view_settings.look = "AgX - Medium High Contrast"
scene.view_settings.exposure = -0.8

bpy.ops.render.render(write_still=True)
print(f"DICKALO_PREVIEW_COMPLETE {OUTPUT} {OUTPUT.stat().st_size / 1024:.0f}KiB")
