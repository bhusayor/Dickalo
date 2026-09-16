"""Render DICKALO's original garden-house construction concept with Blender 4.2+.

Example: Blender -b --factory-startup --python scripts/hero-render/render.py -- --preview
All geometry, camera, lighting and random seeds stay identical between frames.
"""
import argparse
import math
import random
import sys
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser()
parser.add_argument('--preview', action='store_true')
parser.add_argument('--projected', action='store_true')
parser.add_argument('--native-plate', action='store_true')
parser.add_argument('--background-only', action='store_true')
parser.add_argument('--overwrite', action='store_true')
parser.add_argument('--progress', type=float, default=1)
parser.add_argument('--start', type=int, default=0)
parser.add_argument('--end', type=int, default=180)
parser.add_argument('--samples', type=int, default=48)
parser.add_argument('--width', type=int, default=1280)
parser.add_argument('--output', default='/private/tmp/dickalo-hero-render')
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
out = Path(args.output)
out.mkdir(parents=True, exist_ok=True)
random.seed(27)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = args.samples
scene.cycles.use_denoising = True
scene.cycles.seed = 27
scene.cycles.use_animated_seed = False
scene.cycles.max_bounces = 6
scene.cycles.transparent_max_bounces = 8
scene.render.use_persistent_data = True
preferences = bpy.context.preferences.addons['cycles'].preferences
preferences.compute_device_type = 'METAL'
preferences.get_devices()
for device in preferences.devices:
    device.use = device.type == 'METAL'
scene.cycles.device = 'GPU'
scene.render.resolution_x = args.width
scene.render.resolution_y = round(args.width * 9 / 16)
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.view_settings.exposure = 0.25
scene.render.film_transparent = False

def rgb(code):
    vals = [int(code[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(v / 12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in vals) + (1,)

def material(name, color, rough=.6, noise=None, metallic=0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    bs = nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = rgb(color)
    bs.inputs['Roughness'].default_value = rough
    bs.inputs['Metallic'].default_value = metallic
    if noise:
        tex = nodes.new('ShaderNodeTexNoise')
        tex.inputs['Scale'].default_value = noise[0]
        tex.inputs['Detail'].default_value = 3
        coord = nodes.new('ShaderNodeTexCoord')
        links.new(coord.outputs['Object'], tex.inputs['Vector'])
        ramp = nodes.new('ShaderNodeValToRGB')
        ramp.color_ramp.elements[0].color = rgb(noise[1])
        ramp.color_ramp.elements[1].color = rgb(color)
        links.new(tex.outputs['Fac'], ramp.inputs[0])
        links.new(ramp.outputs[0], bs.inputs['Base Color'])
        bump = nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = .25
        bump.inputs['Distance'].default_value = noise[2]
        links.new(tex.outputs['Fac'], bump.inputs['Height'])
        links.new(bump.outputs[0], bs.inputs['Normal'])
    return mat

ivory = material('Warm mineral render', 'ECE9DD', .75, (45, 'DDD8C8', .008))
concrete = material('Board formed concrete', 'B9B3A4', .88, (8, '88877D', .016))
stone = material('Honed ivory limestone', 'DDD2BC', .67)
nodes, links = stone.node_tree.nodes, stone.node_tree.links
texture = nodes.new('ShaderNodeTexImage')
texture.image = bpy.data.images.load(str(ROOT / 'scripts/hero-render/assets/ivory-limestone.png'))
texture.projection = 'BOX'
texture.projection_blend = .2
coord = nodes.new('ShaderNodeTexCoord')
mapping = nodes.new('ShaderNodeVectorMath')
mapping.operation = 'SCALE'
mapping.inputs[3].default_value = .38
links.new(coord.outputs['Object'], mapping.inputs[0])
links.new(mapping.outputs[0], texture.inputs['Vector'])
links.new(texture.outputs['Color'], nodes.get('Principled BSDF').inputs['Base Color'])
bump = nodes.new('ShaderNodeBump')
bump.inputs['Strength'].default_value = .18
bump.inputs['Distance'].default_value = .012
links.new(texture.outputs['Color'], bump.inputs['Height'])
links.new(bump.outputs[0], nodes.get('Principled BSDF').inputs['Normal'])
bronze = material('Bronze anodised frames', '3C4039', .3, metallic=.75)
steel = material('Reinforcing steel', '544B3E', .62, metallic=.65)
wood = material('Iroko timber', '8C6740', .48, (3, '543A24', .008))
soil = material('Sandy laterite', '9E8661', 1, (22, '6A614C', .06))
lawn = material('Zoysia lawn', '5D7534', .97, (30, '354525', .014))
linen = material('Warm linen', 'DFD8BF', .94, (95, 'C9C1AF', .004))
glass = material('Architectural clear glazing', 'EFF8F3', .075)
glass.node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value = 1
glass.node_tree.nodes.get('Principled BSDF').inputs['IOR'].default_value = 1.46
water = material('Reflecting water', '76B9B1', .09)
water.node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value = .85
water.node_tree.nodes.get('Principled BSDF').inputs['IOR'].default_value = 1.333
emission = material('Warm architectural light', 'FFF1CB', .4)
ebs = emission.node_tree.nodes.get('Principled BSDF')
ebs.inputs['Emission Color'].default_value = rgb('FFD593')
ebs.inputs['Emission Strength'].default_value = 4
leaves = [material('Leaf '+str(i), c, .68) for i,c in enumerate(['536B2E', '3F5728', '6D7C37', '344E28', '748B42'])]
for mat in leaves:
    mat.node_tree.nodes.get('Principled BSDF').inputs['Subsurface Weight'].default_value = .055
bark = material('Tree bark', '71634D', .93, (18, '413F30', .025))

growing = []
def grow(obj, start, end, axis=2):
    # Store exact final transforms; each component grows from its original base.
    growing.append((obj, start, end, axis, obj.location.copy(), obj.scale.copy(), obj.dimensions.copy()))
    return obj

def box(name, dims, pos, mat, phase=None, bevel=.018):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat: obj.data.materials.append(mat)
    if bevel:
        modifier = obj.modifiers.new('Soft construction edges', 'BEVEL')
        modifier.width = bevel
        modifier.segments = 2
        modifier = obj.modifiers.new('Weighted corner normals', 'WEIGHTED_NORMAL')
    if phase: grow(obj, *phase)
    return obj

def rod(name, a, b, radius, mat, phase=None):
    a,b = Vector(a),Vector(b)
    vector = b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=radius, depth=vector.length, location=(a+b)/2)
    obj = bpy.context.object
    obj.name=name
    obj.rotation_euler=vector.to_track_quat('Z','Y').to_euler()
    obj.data.materials.append(mat)
    if phase: grow(obj,*phase)
    return obj

def area(name, pos, energy, size, target, color=(1,.8,.55)):
    data=bpy.data.lights.new(name,'AREA')
    data.energy=energy
    data.shape='DISK'
    data.size=size
    data.color=color
    obj=bpy.data.objects.new(name,data)
    scene.collection.objects.link(obj)
    obj.location=pos
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
    obj.visible_glossy=False
    return obj

# A real ground plane and compound replace the previous floating display plinth.
box('Continuous garden ground', (200,200,.3), (0,0,-.22), lawn, bevel=0)
box('Prepared building footprint', (16,10,.15), (1,0,-.04), soil, bevel=.08)
box('Existing rear compound wall', (65,.26,2.15), (0,13,1), ivory)
box('Existing side compound wall', (.26,60,2.15), (19,0,1), ivory)
box('Rear wall coping', (65,.38,.13), (0,13,2.11), stone)
box('Side wall coping', (.38,60,.13), (19,0,2.11), stone)
# Foundation and reinforcement remain fixed, including the first frame.
box('Foundation raft', (14.4,8.4,.23), (1,0,.08), concrete)
for x in range(-58,81,6):
    rod('Foundation rebar', (x/10,-3.9,.21), (x/10,3.9,.21), .013, steel)
for y in range(-38,40,6):
    rod('Foundation rebar', (-5.9,y/10,.24), (7.9,y/10,.24), .013, steel)
box('Ground floor slab', (14.8,8.8,.24), (1,0,.39), concrete, (0,.13,0))
for i,x in enumerate([-5.5,-1.4,2.7,7.5]):
    for y in [-3.6,3.6]:
        box('Ground floor column', (.36,.36,3.25), (x,y,2.11), concrete, (.1+i*.015,.27+i*.015,2))
for y in [-3.6,3.6]:
    box('Ground floor ring beam', (13.4,.38,.35), (1,y,3.58), concrete, (.24,.37,0))
for x in [-5.5,-1.4,2.7,7.5]:
    box('Cross beam', (.38,7.5,.35), (x,0,3.58), concrete, (.25,.38,1))
box('Cantilevered terrace slab', (15.5,9.7,.38), (1,-.3,3.95), ivory, (.3,.46,0))
for i,x in enumerate([-1.05,3.25,7.55]):
    for y in [-3.45,3.45]:
        box('Upper floor column', (.3,.3,3.05), (x,y,5.665), concrete, (.39+i*.012,.55+i*.012,2))
box('Floating upper roof', (10.5,8.6,.35), (3.3,-.05,7.35), ivory, (.52,.67,0))
box('Roof edge shadow reveal', (10.35,8.45,.07), (3.3,-.05,7.17), bronze, (.58,.7,0))
box('Roof parapet rear', (10.3,.23,.38), (3.3,4.05,7.7), ivory, (.6,.71,0))
box('Roof parapet side', (.23,8.1,.38), (8.34,0,7.7), ivory, (.6,.71,1))

# Ground-floor enclosure and the long shaded veranda.
box('Rear enclosure', (13.2,.27,3.25), (1,3.6,2.11), ivory, (.35,.56,2))
box('Left enclosure', (.27,7.4,3.25), (-5.5,0,2.11), ivory, (.36,.58,2))
box('Right stone enclosure', (.3,7.4,3.25), (7.5,0,2.11), stone, (.37,.59,2))
box('Upper rear enclosure', (8.9,.28,3.03), (3.25,3.45,5.66), ivory, (.49,.68,2))
box('Upper left enclosure', (.3,7.1,3.03), (-1.05,0,5.66), ivory, (.5,.7,2))
box('Upper side stone enclosure', (.3,7.1,3.03), (7.55,0,5.66), stone, (.51,.71,2))
box('Stair tower', (1.7,1.9,6.65), (5.85,-3,3.835), stone, (.46,.72,2))
# Fine stone joints (small physical recesses rather than a noisy repeated texture).
for z in [1.1+i*.6 for i in range(10)]:
    box('Tower stone joint', (1.71,.009,.013), (5.85,-3.956,z), concrete, (.7,.78,0), bevel=0)

def window(x, y, bottom, width, height, phase):
    box('Clear glazed panel', (width,.026,height), (x,y,bottom+height/2), glass, phase, bevel=.002)
    for xx in [x-width/2,x+width/2]:
        box('Vertical bronze mullion', (.044,.12,height+.1), (xx,y-.016,bottom+height/2), bronze, (phase[0]+.025,phase[1]+.015,2), bevel=.007)
    for z in [bottom,bottom+height]:
        box('Horizontal bronze track', (width+.06,.12,.045), (x,y-.016,z), bronze, (phase[0]+.025,phase[1]+.015,0), bevel=.007)
for x in [-4.5,-3,-1.5,0,1.5,3]:
    window(x,-3.54,.52,1.46,2.99,(.64,.8,2))
for x in [-.3,1.2,2.7,4.2]:
    window(x,-3.43,4.16,1.46,2.96,(.67,.83,2))
for i in range(10):
    box('Iroko upper privacy fin', (.065,.32,3.06), (6.25+i*.16,-3.82,5.68), wood, (.71+i*.002,.86,2), bevel=.012)
for i in range(13):
    box('Veranda timber soffit', (13.6,.11,.055), (1,-3.75+i*.19,3.73), wood, (.72,.85,0), bevel=.01)

# Furnished interiors visible through actual transmissive glass.
interior_objects=[]
for x in [-3.6,-1.8,0]:
    interior_objects.append(box('Linen sofa cushion', (1.6,.9,.28), (x,-1.3,.88), linen, (.75,.9,2), bevel=.1))
box('Sofa base', (5.3,1.1,.28), (-1.8,-1.2,.65), wood, (.75,.88,2), bevel=.06)
box('Sofa back', (5.3,.22,.7), (-1.8,-.77,1.12), linen, (.77,.91,2), bevel=.1)
box('Travertine coffee table', (2.2,.9,.16), (-1.8,-2.6,.91), stone, (.78,.91,2), bevel=.07)
box('Coffee table plinth', (1.4,.65,.4), (-1.8,-2.6,.67), stone, (.78,.91,2))
box('Upper bedroom bed', (2.3,2.4,.4), (1.5,-.8,4.48), linen, (.77,.91,2), bevel=.14)
box('Bedroom headboard', (2.6,.15,1), (1.5,.4,4.78), wood, (.77,.91,2), bevel=.07)
for level, bottom in [(0,.6),(1,4.2)]:
    for x in [-4.9,-4.75,-4.6] if level==0 else [-.76,-.62,-.48]:
        box('Linen curtain fold', (.16,.16,2.85), (x,-3.24,bottom+1.425), linen, (.78,.9,2), bevel=.07)
interior_lights=[area('Warm living room bounce',(-1,0,3.3),240,4,(-1,-2,1)), area('Warm upper room bounce',(2,0,6.7),180,3,(2,-3,5))]
for x in [-4,-1,2]:
    box('Veranda recessed warm light', (.07,.07,.035), (x,-4.32,3.745), emission, (.87,.95,0), bevel=.01)
box('Warm roofline illumination', (6.1,.025,.03), (1.9,-3.54,7.095), emission, (.86,.96,0), bevel=.006)

# Floating glass terrace balustrade with bronze capping.
for i in range(4):
    box('Terrace glass balustrade', (1.09,.022,.93), (-5.15+i*1.12,-4.93,4.625), glass, (.76,.88,2), bevel=.003)
box('Terrace bronze cap', (4.6,.045,.045), (-3.45,-4.93,5.11), bronze, (.79,.9,0), bevel=.008)
box('Garden terrace', (16.2,2.3,.24), (1,-5.0,.31), stone, (.76,.88,0))
for i in range(3):
    box('Garden entrance step', (4.1,.6,.13), (-2.2,-6.3-i*.55,.28-i*.085), stone, (.78,.89,0))
for row in range(2):
    for i in range(9):
        box('Terrace stone joint', (.015,1.02,.006), (-6+i*1.8,-4.45-row*1.08,.433), concrete, (.82,.9,1), bevel=0)
for i in range(8):
    box('Garden stepping stone', (1.5,.9,.08), (-2.2-i*.62,-8.05-i*1.25,-.025), stone, (.79+i*.009,.96,0), bevel=.025)
box('Reflecting basin', (7,3.1,.17), (5.8,-9.2,.015), stone, (.8,.9,0), bevel=.04)
box('Reflecting pool water', (6.65,2.75,.028), (5.8,-9.2,.111), water, (.88,.99,0), bevel=.01)

# Mesh foliage: individual folded leaves and branching trunks, no low-poly spheres.
def leaf_mesh(name, centers, lengths, phase=None):
    verts, faces, mids = [],[],[]
    for center,length in zip(centers,lengths):
        c=Vector(center)
        theta=random.uniform(0,math.tau)
        u=Vector((math.cos(theta),math.sin(theta),random.uniform(-.3,.4))) * length
        v=Vector((-math.sin(theta),math.cos(theta),random.uniform(-.2,.2))) * length*.36
        n=len(verts)
        verts.extend([c-u*.5,c+v,c+Vector((0,0,length*.12)),c-v,c+u*.5])
        faces.extend([(n,n+1,n+2),(n,n+2,n+3),(n+2,n+1,n+4),(n+3,n+2,n+4)])
        mids.extend([random.randrange(len(leaves))]*4)
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    obj=bpy.data.objects.new(name,mesh)
    scene.collection.objects.link(obj)
    for mat in leaves: mesh.materials.append(mat)
    for poly,index in zip(mesh.polygons,mids): poly.material_index=index
    if phase: grow(obj,*phase)
    return obj

def tree(x,y,height,radius):
    rod('Mature tropical tree trunk',(x,y,-.1),(x+.2,y,height*.7),.18,bark)
    centers=[]
    lengths=[]
    for j in range(10):
        a=j*2.4
        end=Vector((x+math.cos(a)*radius*.6,y+math.sin(a)*radius*.6,height*(.65+random.random()*.3)))
        rod('Natural tree branching',(x+.1,y,height*.42),end,.075,bark)
        for k in range(650):
            theta=random.uniform(0,math.tau)
            z=random.uniform(-1,1)
            rr=random.random()**(1/3)*radius*.64
            c=end+Vector((math.sqrt(1-z*z)*math.cos(theta)*rr,math.sqrt(1-z*z)*math.sin(theta)*rr,z*rr*.65))
            centers.append(c)
            lengths.append(random.uniform(.15,.35))
    leaf_mesh('Detailed tropical tree canopy',centers,lengths)

for x,y,h,r in [(-14,2,9,4.5),(-17,-7,10,4.2),(-8,11,8,3.5),(1,17,11,4),(12,15,10,4),(21,7,12,4),(23,-7,10,4)]:
    tree(x,y,h,r)

def palm(x,y,height):
    rod('Palm trunk',(x,y,0),(x+.4,y,height),.16,bark)
    centers=[]
    lengths=[]
    for j in range(12):
        a=j*math.tau/12
        for i in range(22):
            t=i/21
            p=Vector((x+.4+math.cos(a)*t*3,y+math.sin(a)*t*3,height+math.sin(t*math.pi)*.5-t*t*.7))
            for side in [-1,1]:
                centers.append(p+Vector((-math.sin(a)*side*.22,math.cos(a)*side*.22,0)))
                lengths.append(.65*(1-t*.7))
    leaf_mesh('Palm fronds',centers,lengths)
for x,y,h in [(-10,8,8.8),(14,8,9),(16,-4,8)]: palm(x,y,h)

# Dense planting borders stay rooted; new garden planting grows late in the build.
for row in [(-8,range(-7,10)),(10,range(-5,11))]:
    x,ys=row
    centers=[]
    lengths=[]
    for y in ys:
        for j in range(180):
            centers.append((x+random.uniform(-.5,.5),y+random.uniform(-.6,.6),random.uniform(.08,.7)))
            lengths.append(random.uniform(.12,.26))
    plant=leaf_mesh('Layered garden border',centers,lengths)
    grow(plant,.84,.99,2)
# Fine lawn blades break up the ground silhouette and catch sunlight.
verts=[]
faces=[]
for i in range(43000):
    x=random.uniform(-22,20); y=random.uniform(-24,14)
    if (-7<x<9 and -6.5<y<5) or (2.1<x<9.5 and -10.9<y<-7.4): continue
    if any(abs(x-(-2.2-j*.62))<.82 and abs(y-(-8.05-j*1.25))<.5 for j in range(8)): continue
    z=-.055; h=random.uniform(.025,.085); w=.009
    n=len(verts)
    verts.extend([(x-w,y,z),(x+w,y,z),(x+random.uniform(-.035,.035),y+.02,z+h)])
    faces.append((n,n+1,n+2))
mesh=bpy.data.meshes.new('Garden grass blades')
mesh.from_pydata(verts,[],faces)
obj=bpy.data.objects.new('Garden grass blades',mesh)
scene.collection.objects.link(obj)
mesh.materials.append(leaves[0])

# Physically based sky and a large soft sun; keep light direction fixed across frames.
world=bpy.data.worlds.new('Warm Lagos morning')
scene.world=world
world.use_nodes=True
wn=world.node_tree.nodes
sky=wn.new('ShaderNodeTexSky')
sky.sky_type='NISHITA'
sky.sun_elevation=math.radians(28)
sky.sun_rotation=math.radians(135)
sky.sun_size=math.radians(2)
sky.air_density=1.1
sky.dust_density=1.5
world.node_tree.links.new(sky.outputs['Color'],wn.get('Background').inputs['Color'])
wn.get('Background').inputs['Strength'].default_value=.38
area('Soft frontal daylight', (1,-15,15), 1700, 14, (1,0,3), (1,.94,.83))

bpy.ops.object.camera_add(location=(22,-33,10.3))
camera=bpy.context.object
camera.name='Fixed architectural camera'
camera.rotation_euler=(Vector((-2.1,0,2.55))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.lens=41
camera.data.clip_end=300
scene.camera=camera

if args.projected or args.native_plate:
    # Fixed-camera projection is a standard matte-painting workflow: bake the
    # photographic surface treatment onto the actual building components.
    # Geometry still assembles in 3D; there are no crossfades or image wipes.
    scene.view_settings.view_transform='Standard'
    scene.view_settings.look='None'
    scene.view_settings.exposure=0
    scene.render.film_transparent=True
    scene.cycles.samples=min(args.samples,16)
    wn.get('Background').inputs['Strength'].default_value=.045
    for light in scene.objects:
        if light.type=='LIGHT' and light.name=='Soft frontal daylight':
            light.data.energy=600 if args.native_plate else 350
    photo=bpy.data.images.load(str(ROOT/'scripts/hero-render/assets/garden-house-finish.png'))
    plate=bpy.data.images.load(str(ROOT/'scripts/hero-render/assets/garden-plot.png'))
    projected=bpy.data.materials.new('Fixed-camera photographic finish')
    projected.use_nodes=True
    pn,pl=projected.node_tree.nodes,projected.node_tree.links
    pn.clear()
    geometry=pn.new('ShaderNodeNewGeometry')
    attribute=pn.new('ShaderNodeVectorTransform')
    attribute.vector_type='POINT'
    attribute.convert_from='WORLD'
    attribute.convert_to='CAMERA'
    pl.new(geometry.outputs['Position'],attribute.inputs['Vector'])
    split=pn.new('ShaderNodeSeparateXYZ')
    pl.new(attribute.outputs['Vector'],split.inputs[0])
    negative=pn.new('ShaderNodeMath'); negative.operation='MULTIPLY'; negative.inputs[1].default_value=-1
    pl.new(split.outputs['Z'],negative.inputs[0])
    denominator=pn.new('ShaderNodeCombineXYZ')
    for component in ['X','Y','Z']: pl.new(negative.outputs[0],denominator.inputs[component])
    divide=pn.new('ShaderNodeVectorMath'); divide.operation='DIVIDE'
    pl.new(attribute.outputs['Vector'],divide.inputs[0]); pl.new(denominator.outputs[0],divide.inputs[1])
    multiply=pn.new('ShaderNodeVectorMath'); multiply.operation='MULTIPLY'
    # Blender's camera-space Y axis is inverted relative to image texture V.
    # Flip it here so a pixel at the roof remains on the roof instead of
    # sampling the lawn from the lower half of the photographic plate.
    multiply.inputs[1].default_value=(camera.data.lens/camera.data.sensor_width,-camera.data.lens/camera.data.sensor_width*16/9,0)
    pl.new(divide.outputs[0],multiply.inputs[0])
    offset=pn.new('ShaderNodeVectorMath'); offset.operation='ADD'; offset.inputs[1].default_value=(.5,.5,0)
    pl.new(multiply.outputs[0],offset.inputs[0])
    image_node=pn.new('ShaderNodeTexImage'); image_node.image=photo; image_node.extension='EXTEND'
    pl.new(offset.outputs[0],image_node.inputs['Vector'])
    emit=pn.new('ShaderNodeEmission'); pl.new(image_node.outputs['Color'],emit.inputs['Color'])
    output=pn.new('ShaderNodeOutputMaterial'); pl.new(emit.outputs[0],output.inputs['Surface'])
    growing=[part for part in growing if 'garden border' not in part[0].name.lower()]
    animated={obj for obj,*_ in growing}
    bpy.context.view_layer.update()
    camera_inverse=camera.matrix_world.inverted()
    unpainted=('column','beam','sofa','Sofa','coffee','Coffee','bed','Bedroom','curtain','Curtain','light','illumination','border','Ground floor slab')
    for obj in list(scene.objects):
        if obj.type!='MESH': continue
        if obj not in animated and not obj.name.startswith(('Foundation raft','Foundation rebar')):
            obj.hide_render=True
            continue
        if args.native_plate:
            continue
        if obj not in animated or any(word.lower() in obj.name.lower() for word in unpainted): continue
        # Keep photo detail at its projected location while the mesh assembles.
        # Growing glazing reveals reflections; it must never squash the interior.
        bpy.context.view_layer.objects.active=obj
        for modifier in list(obj.modifiers): bpy.ops.object.modifier_apply(modifier=modifier.name)
        obj.data.materials.append(projected)
        bpy.context.view_layer.update()
        depsgraph=bpy.context.evaluated_depsgraph_get()
        for polygon in obj.data.polygons:
            point=obj.matrix_world@polygon.center
            direction=(point-camera.location).normalized()
            hit,position,normal,index,hit_object,matrix=scene.ray_cast(depsgraph,camera.location,direction)
            # Unexposed structural surfaces keep their real concrete material.
            if hit and hit_object.original==obj and (position-point).length<.035:
                polygon.material_index=1
    # The garden is a single stable photographic backplate for the whole sequence.
    scene.use_nodes=True
    cn,cl=scene.node_tree.nodes,scene.node_tree.links
    cn.clear()
    background=cn.new('CompositorNodeImage'); background.image=plate
    resize=cn.new('CompositorNodeScale'); resize.space='RENDER_SIZE'; resize.frame_method='STRETCH'
    cl.new(background.outputs['Image'],resize.inputs[0])
    rendered=cn.new('CompositorNodeRLayers')
    over=cn.new('CompositorNodeAlphaOver'); over.inputs[0].default_value=1
    cl.new(resize.outputs[0],over.inputs[1]); cl.new(rendered.outputs['Image'],over.inputs[2])
    composite=cn.new('CompositorNodeComposite'); cl.new(over.outputs[0],composite.inputs[0])

def progress(p):
    for obj,start,end,axis,location,scale,dims in growing:
        amount=max(0,min(1,(p-start)/(end-start)))
        amount=amount*amount*(3-2*amount)
        obj.hide_render=amount<=0
        obj.location=location
        obj.scale=scale
        if axis==3:
            obj.scale=scale*max(.0001,amount)
        else:
            obj.scale[axis]=scale[axis]*max(.0001,amount)
            obj.location[axis]-=dims[axis]*(1-amount)/2
    life=max(0,min(1,(p-.8)/.2))
    for light in interior_lights: light.data.energy=240*life
    bpy.context.view_layer.update()

if args.background_only:
    for obj in scene.objects:
        if obj.type=='MESH': obj.hide_render=True
    scene.cycles.samples=1
    scene.render.filepath=str(out/'background.png')
    bpy.ops.render.render(write_still=True)
elif args.preview:
    progress(args.progress)
    scene.render.filepath=str(out/f'preview-{args.progress:.2f}.png')
    bpy.ops.wm.save_as_mainfile(filepath=str(out/'garden-house.blend'))
    bpy.ops.render.render(write_still=True)
else:
    for frame in range(args.start,args.end+1):
        target=out/f'frame-{frame:03d}.png'
        if target.exists() and not args.overwrite: continue
        progress(frame/180)
        scene.render.filepath=str(target)
        bpy.ops.render.render(write_still=True)
        print(f'DICKALO_FRAME {frame}/180',flush=True)
