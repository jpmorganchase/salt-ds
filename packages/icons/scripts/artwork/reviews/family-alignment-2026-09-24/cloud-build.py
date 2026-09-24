import json, pathlib, math, re, xml.etree.ElementTree as ET
import pathops
from fontTools.svgLib.path import parse_path
from fontTools.pens.svgPathPen import SVGPathPen
base=pathlib.Path(__file__).parent
data=json.loads((base/'cloud-input.json').read_text())
def path(d):
 p=pathops.Path();parse_path(d,p.getPen());return p
def union(a,b):return pathops.op(a,b,pathops.PathOp.UNION)
def stroke(p,w,cap=pathops.LineCap.BUTT_CAP,join=pathops.LineJoin.MITER_JOIN):
 p=pathops.Path(p);p.stroke(w,cap,join,4);p.convertConicsToQuads(0.0002);return p
def paint(mark,weight):
 result=pathops.Path()
 for element in ET.fromstring('<svg>'+mark+'</svg>'):
  p=path(element.attrib['d'])
  if element.attrib.get('fill')=='currentColor':result=union(result,p)
  if element.attrib.get('stroke')=='currentColor':result=union(result,stroke(p,float(element.attrib['stroke-width'])*weight/data['fit']))
 return result
def offset(p,d):return union(p,stroke(p,2*d,pathops.LineCap.ROUND_CAP,pathops.LineJoin.ROUND_JOIN))
mark=paint(data['mark'],7/6)
clear=offset(mark,.75/data['fit'])
surface=union(path(data['cloud']),paint(data['rim'],1.5))
surface=pathops.op(surface,clear,pathops.PathOp.DIFFERENCE)
# Both action pockets must open to the outside; discard the detached
# sliver between them so the cloud remains one connected surface.
contours=list(surface.contours)
assert 1 <= len(contours) <= 2
if len(contours) == 2:
 assert min(p.area for p in contours) < 1
surface=max(contours,key=lambda p:p.area)
pen=SVGPathPen(None);surface.draw(pen);solid=pen.getCommands()
# Cut the cloud's centerline against complete foreground clearance, including
# the cloud's own midpoint half-width. Subdivide the retained cubic segments.
guard=offset(clear,7/12/data['fit'])
segments=[
 [[4.7,10],[2.87746,10],[1.4,8.52254],[1.4,6.7]],
 [[1.4,6.7],[1.4,5.06],[2.59633,3.69942],[4.1639,3.44333]],
 [[4.1639,3.44333],[4.91833,2.10431],[6.35356,1.2],[8,1.2]],
 [[8,1.2],[10.06165,1.2],[11.79213,2.61793],[12.26943,4.53178]],
 [[12.26943,4.53178],[13.5891,4.73375],[14.6,5.87382],[14.6,7.25]],
 [[14.6,7.25],[14.6,8.76878],[13.36877,10],[11.85,10]],
]
def lerp(a,b,t):return [a[i]+(b[i]-a[i])*t for i in range(2)]
def split(p,t):
 a,b,c=[lerp(p[i],p[i+1],t) for i in range(3)]
 d,e=lerp(a,b,t),lerp(b,c,t);m=lerp(d,e,t)
 return [p[0],a,d,m],[m,e,c,p[3]]
def pt(p,t):return split(p,t)[0][-1]
visible=[]
for index,p in enumerate(segments):
 samples=[not guard.contains(tuple(pt(p,t/1000))) for t in range(1001)]
 if not any(samples):continue
 lo=samples.index(True)/1000;hi=(1000-list(reversed(samples)).index(True))/1000
 for boundary in ['lo','hi']:
  v=lo if boundary=='lo' else hi
  if v in [0,1]:continue
  a=max(0,v-.002);b=min(1,v+.002)
  for _ in range(25):
   m=(a+b)/2;outside=not guard.contains(tuple(pt(p,m)))
   if outside==(boundary=='lo'):b=m
   else:a=m
  if boundary=='lo':lo=(a+b)/2
  else:hi=(a+b)/2
 q=split(p,hi)[0]
 if lo:q=split(q,lo/hi)[1]
 visible.append(q)
def fmt(p):return ' '.join(f'{x:.6f}' for x in p)
outline='M'+fmt(visible[0][0])+''.join('C'+' '.join(fmt(v) for v in q[1:]) for q in visible)
a,b=10.5,11.85
for _ in range(40):
 m=(a+b)/2
 if guard.contains((m,10)):a=m
 else:b=m
outline+='H'+str((a+b)/2)
result={'outline':outline,'surface':solid,'arrows':data['arrows']}
(base/'cloud-result.json').write_text(json.dumps(result))
print({'cloud_retained_cubics':len(visible),'surface_contours':len(list(surface.contours)),'outline_start':visible[0][0],'outline_end':visible[-1][-1]})
