"""Native Platinum terrain plans and warp references, without ROM artwork.
python scripts/build-platinum-maps.py PINNED_POKEPLATINUM_CHECKOUT
Uses the same Atlas image/floor/viewer contract as SoulSilver.
"""
import binascii,hashlib,json,pathlib,struct,subprocess,sys,zlib
ROOT=pathlib.Path(__file__).resolve().parents[1];src=pathlib.Path(sys.argv[1]);REV='49f78f35ccd8c6880e189d23a630eef2976c44ac'
assert subprocess.check_output(['git','-C',str(src),'rev-parse','HEAD'],text=True).strip()==REV
assert not subprocess.check_output(['git','-C',str(src),'status','--porcelain','--untracked-files=no'],text=True).strip()
data=json.loads((ROOT/'js/data/games/platinum/atlas.js').read_text().split(' = ',1)[1].rstrip(';\n'))
out=ROOT/'assets/maps/platinum';out.mkdir(parents=True,exist_ok=True)
palette=[(230,238,220),(75,91,84),(102,171,106),(85,146,192),(244,190,86),(207,207,207)]
used={};maps={};byheader={};metadata={}
def doc(path):
 raw=(src/path).read_bytes();used[path]=hashlib.sha256(raw).hexdigest();return json.loads(raw)
def chunk(kind,value):return struct.pack('>I',len(value))+kind+value+struct.pack('>I',binascii.crc32(kind+value)&0xffffffff)
def png(width,height,pixels):
 raw=b''.join(b'\0'+pixels[y*width:(y+1)*width] for y in range(height))
 return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>2I5B',width,height,8,3,0,0,0))+chunk(b'PLTE',bytes(c for color in palette for c in color))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b'')
for key,area in data['areas'].items():
 header=data['headers'][key];path='res/field/matrices/'+header['mapMatrixID']+'.json';matrix=doc(path)
 cells=[(x,y,tile) for y,row in enumerate(matrix['maps']) for x,tile in enumerate(row) if tile!='MAP_NONE' and (not matrix.get('headers') or matrix['headers'][y][x]==key)]
 assert cells,key
 left,top=min(x for x,y,t in cells)*32,min(y for x,y,t in cells)*32
 right,bottom=(max(x for x,y,t in cells)+1)*32,(max(y for x,y,t in cells)+1)*32
 width,height=(right-left)*8,(bottom-top)*8;pixels=bytearray([5])*(width*height)
 warps=area['warps'];exits={(w['x'],w['z']) for w in warps}
 for x,y,tile in cells:
  file=f'res/field/maps/data/map_data_{int(tile[4:]):03}.bin';raw=(src/file).read_bytes();used[file]=hashlib.sha256(raw).hexdigest()
  assert struct.unpack_from('<I',raw)[0]==2048
  for i,v in enumerate(struct.unpack_from('<1024H',raw,16)):
   gx,gz=x*32+i%32,y*32+i//32;behavior=v&255
   color=4 if (gx,gz) in exits else 1 if v&0x8000 else 2 if behavior in [2,3] else 3 if behavior in [16,19,21,23] else 0
   px,py=(gx-left)*8,(gz-top)*8
   for dy in range(8):pixels[(py+dy)*width+px:(py+dy)*width+px+8]=bytes([color])*8
 file=key.removeprefix('MAP_HEADER_').lower()+'.png';raw=png(width,height,pixels);(out/file).write_bytes(raw)
 record={'id':key,'label':area['label']+' · native terrain plan','file':'platinum/'+file,'width':width,'height':height,'sha256':hashlib.sha256(raw).hexdigest(),'source':f'https://github.com/pret/pokeplatinum/blob/{REV}/{area["eventSource"]}','kind':'terrain-plan','context':'outdoor' if header['mapType'] in ['MAP_TYPE_OUTDOORS','MAP_TYPE_TOWN_CITY'] else 'interior','notice':'Platinum native tile plan, north up. Green: grass; blue: water; dark: blocked terrain; orange: native exit tiles. Static attributes only: objects, height, one-way terrain and scripts also control movement.'+(' Distortion World uses gravity/camera changes; this flat projection is not a solution to its traversal puzzle.' if area['location']=='Distortion World' else '')}
 maps.setdefault(area['location'],[]).append(record);byheader[key]=record
 metadata[key]={'origin':[left,top],'scale':8,'matrix':path,'cells':len(cells),'width':width,'height':height}
# Each pair is a literal native warp, independently checked against destination
# warp indices. Non-reciprocal links are explicitly one-way references.
links={};seen=set();total=0
for key,area in data['areas'].items():
 for i,w in enumerate(area['warps']):
  dest=w['dest_header_id'];target=data['areas'].get(dest);index=w['dest_warp_id']
  if not target or target['location']!=area['location'] or not isinstance(index,int) or not 0<=index<len(target['warps']):continue
  other=target['warps'][index];pair=(key,i,dest,index);reverse=(dest,index,key,i)
  reciprocal=other['dest_header_id']==key and other['dest_warp_id']==i
  if pair in seen or reciprocal and reverse in seen:continue
  seen.add(pair)
  ends=[]
  for h,event in [(key,w),(dest,other)]:
   m=metadata[h];x=(event['x']-m['origin'][0]+.5)*8;y=(event['z']-m['origin'][1]+.5)*8
   assert 0<=x<=m['width'] and 0<=y<=m['height'],(h,event,m)
   ends.append({'mapId':h,'x':x,'y':y,'label':data['areas'][h]['label']})
  name=area['location'];entry=links.setdefault(name,{'heading':'Native exits / stairs','arrivalLabel':'exit','help':'Literal native warp references. Some exits are moved/disabled by story scripts; dynamic puzzle warps and scripted travel are listed separately. Matching IDs show the referenced destination, not a guaranteed unobstructed walking path.','pairs':[]})
  entry['pairs'].append({'id':'W'+str(len(entry['pairs'])+1).zfill(2),'label':area['label']+' → '+target['label'],'ends':ends,**({'oneWay':True} if not reciprocal else {}),'source':area['eventSource'],'warpIndices':[i,index]});total+=1
# Remove only this generator's obsolete Platinum outputs; never touch other games.
expected_files={r['file'].split('/',1)[1] for r in byheader.values()}
for obsolete in out.glob('*.png'):
 if obsolete.name not in expected_files:obsolete.unlink()
(ROOT/'js/data/games/platinum/maps.js').write_text('// Generated native Platinum terrain plans and literal warp references.\nexport const PLATINUM_MAPS = '+json.dumps({'gameId':'platinum','locations':maps,'links':links},ensure_ascii=False,separators=(',',':'))+';\n')
report={'gameId':'platinum','revision':REV,'atlasInputSha256':hashlib.sha256((ROOT/'js/data/games/platinum/atlas.js').read_bytes()).hexdigest(),'views':len(byheader),'locationGroups':len(maps),'warpReferences':total,'nativeAttributeOffset':16,'tileSize':8,'inputs':used,'viewsByHeader':metadata,'outputSha256':{r['file']:r['sha256'] for r in byheader.values()},'notice':'Numeric terrain projection, not artwork/screenshot or full collision simulation. Source code/art remain their respective owners’ works; output contains tile facts and our palette only.'}
(ROOT/'docs/platinum-map-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(f'{len(byheader)} terrain plans / {len(maps)} location groups; {total} native warp references.')
