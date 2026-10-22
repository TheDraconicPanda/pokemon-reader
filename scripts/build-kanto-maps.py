"""Reproduce Kanto views using the existing pinned archive plus clean HGSS terrain.
Usage: python scripts/build-kanto-maps.py /path/to/pokeheartgold /path/to/Kanto.zip
Existing Johto maps, hashes and catalogue are not rewritten.
"""
import argparse,hashlib,importlib.util,json,pathlib,re,struct,subprocess,tempfile,urllib.parse,zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
ARCHIVE_SHA='050a5a8272217b49388ee90b033c1ee99bbab88454c96eacdb7e2c84475a1ae7'
REV='d2355244ac42b3c6e40d8c36aa3564ee8706dea4'
def sha(b):return hashlib.sha256(b).hexdigest()
def slug(s):return re.sub('[^a-z0-9]+','-',s.lower()).strip('-')
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('primary',type=pathlib.Path);p.add_argument('archive',type=pathlib.Path);a=p.parse_args()
 if sha(a.archive.read_bytes())!=ARCHIVE_SHA:raise SystemExit('Incorrect pinned Kanto archive')
 if subprocess.check_output(['git','-C',str(a.primary),'rev-parse','HEAD'],text=True).strip()!=REV or subprocess.check_output(['git','-C',str(a.primary),'status','--porcelain','--untracked-files=no'],text=True).strip():raise SystemExit('Expected pinned clean primary')
 hp='src/data/map_headers.h';hb=(a.primary/hp).read_bytes();headers={n:dict(re.findall(r'\.(\w+) = ([^,\n]+)',b)) for n,b in re.findall(r'\[(MAP_\w+)\]\s*=\s*\{(.*?)\n\s*\},?',hb.decode(),re.S)}
 spec=importlib.util.spec_from_file_location('interiors',ROOT/'scripts/build-soulsilver-interiors.py');r=importlib.util.module_from_spec(spec);spec.loader.exec_module(r)
 landpath='files/a/0/6/5';land=(a.primary/landpath).read_bytes();members=r.narc_members(land);inputs={hp:sha(hb),landpath:sha(land)}
 config=json.loads((ROOT/'scripts/soulsilver-kanto-inventory.json').read_text());census=json.loads((ROOT/'docs/atlas-kanto-primary-census.json').read_text());groups={l['name']:[m['mapId'] for m in census['maps'] if m['location']==l['name']] for l in config['locations']}
 selected={};evidence=[];assets=ROOT/'assets/maps'
 def entry(name,id,label,file,source,**meta):
  data=(assets/file).read_bytes();w,h=struct.unpack('>II',data[16:24]);selected.setdefault(name,[]).append(dict(id=id,label=label,file=file,width=w,height=h,sha256=sha(data),source=source,**meta))
 art={1:255,2:185,3:217,4:220,5:75,6:30,7:94,8:40,9:53,10:54,11:22,12:154,13:155,14:131,15:132,16:101,17:102,18:103,19:287,20:286,21:262,22:338,24:81,25:82}
 artworks=[(f'Route {n}','overview','Overview',layer,[]) for n,layer in art.items()]
 for name,layer in [('Pallet Town',256),('Viridian City',246),('Pewter City',210),('Cerulean City',71),('Lavender Town',51),('Vermilion City',0),('Celadon City',97),('Fuchsia City',128),('Cinnabar Island',278),('Saffron City',37),('Diglett’s Cave',181),('Mt. Moon',218),('Mt. Moon Square',219),('Viridian Forest',192),('Underground Path',77)]:artworks.append((name,'overview','Overview',layer,[]))
 for name,id,label,layer,ids in [('Rock Tunnel','1f','1F',86,['MAP_ROCK_TUNNEL_1F']),('Rock Tunnel','b1f','B1F',87,['MAP_ROCK_TUNNEL_B1F']),('Cerulean Cave','1f','1F',321,['MAP_CERULEAN_CAVE_1F']),('Cerulean Cave','2f','2F',322,['MAP_CERULEAN_CAVE_2F']),('Cerulean Cave','b1f','B1F',323,['MAP_CERULEAN_CAVE_B1F'])]:artworks.append((name,id,label,layer,ids))
 for i,floor in enumerate(['1F','B1F','B2F','B3F','B4F']):artworks.append(('Seafoam Islands',floor.lower(),floor,367+i,['MAP_SEAFOAM_ISLANDS_'+floor]))
 for town,layer in [('Saffron City',38),('Cerulean City',73),('Celadon City',121),('Vermilion City',184),('Pewter City',215),('Viridian City',248),('Fuchsia City',314),('Seafoam Islands',284)]:artworks.append((town,'gym','Cinnabar Gym' if town=='Seafoam Islands' else 'Gym',layer,[]))
 with tempfile.TemporaryDirectory(prefix='kanto-xcf-') as tmp:
  with zipfile.ZipFile(a.archive) as z:z.extract('Kanto/Kanto.xcf',tmp)
  xcf=pathlib.Path(tmp)/'Kanto/Kanto.xcf'
  # Exact source layer names, recorded alongside checksums; never export trainer/item overlays.
  labels=subprocess.check_output(['identify','-format','%s %l\n',str(xcf)],text=True)
  layers={int(n):s for n,s in re.findall(r'^(\d+) (.+)$',labels,re.M)}
  for name,id,label,layer,ids in artworks:
   image=layers[layer]
   if not image.endswith('_HGSS.png'):raise ValueError('Unverified artwork layer '+image)
   file='kanto-'+slug(name)+'-'+id+'.png';dest=assets/file
   subprocess.run(['convert',f'{xcf}[{layer}]','+repage','-define','png:exclude-chunk=date,time',str(dest)],check=True)
   entry(name,id,label,file,'https://archives.bulbagarden.net/wiki/File:'+urllib.parse.quote(image,safe='._'),archive='Kanto',layer=layer,mapIds=ids,**({'kind':'floorplan','notice':'HGSS Gym reference; objects and Trainers depend on story progress.'} if id=='gym' else {}))
 # Named facilities retain actual room/floor choices. Generic houses remain grouped reference scope.
 facilities=[l['name'] for l in config['locations'] if l['type']=='facility' and l['name']!='Underground Path']
 plans=[(name,n) for name in facilities for n in groups[name]]
 plans.append(('Mt. Moon Square','MAP_MOUNT_MOON_SQUARE_ENTRANCE'))
 for name,n in plans:
  h=headers[n];matrixpath='files/fielddata/mapmatrix/map_matrix/'+h['matrixId'].removeprefix('NARC_map_matrix_').removesuffix('_bin')+'.bin';matrix=(a.primary/matrixpath).read_bytes();inputs[matrixpath]=sha(matrix)
  mw,mh,models=r.matrix_models(matrix)
  if mw*mh>16 or 65535 in models:raise ValueError('Review empty/shared/large matrix for '+n)
  width,height=mw*32,mh*32;grid=[0]*(width*height)
  for i,model in enumerate(models):
   raw=members[model]
   if struct.unpack_from('<I',raw)[0]!=0x800:raise ValueError('Unexpected HGSS terrain data')
   attrs=struct.unpack('<1024H',raw[0x14:0x814])
   for z in range(32):
    for x in range(32):grid[(i//mw*32+z)*width+i%mw*32+x]=attrs[z*32+x]
  eventpath='files/fielddata/eventdata/zone_event/'+h['eventsBank'].removeprefix('NARC_zone_event_').removesuffix('_bin')+'.json';raw=(a.primary/eventpath).read_bytes();inputs[eventpath]=sha(raw);warps=json.loads(raw).get('warps',[])
  points=[(i%width,i//width) for i,v in enumerate(grid) if v]+[(w['x'],w['z']) for w in warps]
  if not points or any(not(0<=x<width and 0<=z<height) for x,z in points):raise ValueError('Unexpected coordinates for '+n)
  left,top,right,bottom=min(x for x,z in points),min(z for x,z in points),max(x for x,z in points),max(z for x,z in points)
  tile=12 if right-left>32 or bottom-top>40 else 18;pw=max(620,(right-left+1)*tile+40);ph=(bottom-top+1)*tile+142;ox=(pw-(right-left+1)*tile)//2;oy=76;draw=[]
  def text(x,y,t,size=14):draw.append(f"fill '#172554' font-size {size} text {x},{y} '"+t.replace("'","\\'")+"'")
  label=n.removeprefix('MAP_').replace('_',' ').title().replace('1F','1F');text(20,26,name,18);text(20,50,label+' — terrain plan',12)
  for z in range(top,bottom+1):
   for x in range(left,right+1):
    v=grid[z*width+x];color='#334155' if v&0x8000 else '#e5e7eb' if v else '#fafaf5';px,py=ox+(x-left)*tile,oy+(z-top)*tile
    draw.append(f"fill '{color}' stroke '#cbd5e1' stroke-width 0.3 rectangle {px},{py} {px+tile-1},{py+tile-1}")
  for w in warps:
   px,py=ox+(w['x']-left)*tile,oy+(w['z']-top)*tile;draw.append(f"fill '#f59e0b' stroke none rectangle {px+2},{py+2} {px+tile-3},{py+tile-3}")
  text(20,ph-40,'Dark: static collision flag. Amber: warp. Pale: no static collision flag.',12);text(20,ph-20,'Objects, heights and scripts can restrict movement; this is a terrain reference.',12)
  id='kanto-plan-'+slug(n.removeprefix('MAP_'));file=id+'.png';dest=assets/file
  draw_args=[]
  for start in range(0,len(draw),200):draw_args+=['-draw',' '.join(draw[start:start+200])]
  subprocess.run(['convert','-size',f'{pw}x{ph}','xc:#f4f6ef','-font','DejaVu-Sans',*draw_args,'-strip','-define','png:exclude-chunk=date,time','PNG24:'+str(dest)],check=True)
  notice='Game-data terrain plan, not a rendered screenshot or a complete movement map. Objects, heights and scripts can restrict movement.'
  if n=='MAP_CELADON_GAME_CORNER_JP':notice+=' Japanese HGSS slots-room variant; international HGSS uses Voltorb Flip.'
  if n=='MAP_SAFFRON_SILPH_CO_ROTOM_ROOM':notice+=' Requires an eligible Rotom; this room changes forms and supplies no Rotom.'
  if n.endswith('_EMPTY'):notice+=' Empty train-platform story variant.'
  entry(name,id,label+' · terrain plan',file,f'https://github.com/pret/pokeheartgold/blob/{REV}/{eventpath}',kind='terrain-plan',notice=notice,mapIds=[n],context='outdoor' if n=='MAP_PAL_PARK' else 'interior')
  evidence.append(dict(location=name,mapId=n,matrix=matrixpath,models=list(models),events=eventpath,bounds=[left,top,right,bottom],file=file,sha256=sha(dest.read_bytes())))
 for l in config['locations']:
  if not selected.get(l['name']):raise ValueError('Missing map for '+l['name'])
 result=dict(gameId='soulsilver',locations=selected)
 (ROOT/'js/data/games/soulsilver/kanto-maps.js').write_text('// Generated verified Kanto artwork and labelled primary terrain plans.\nexport const KANTO_MAPS = Object.freeze('+json.dumps(result,ensure_ascii=False,indent=2)+');\n')
 (ROOT/'docs/atlas-kanto-map-evidence.json').write_text(json.dumps(dict(gameId='soulsilver',primaryRevision=REV,archiveRevision='7840506be21bc5636f8d3d92b93266e202e6d63b',archiveSha256=ARCHIVE_SHA,inputs=inputs,locations=len(selected),views=sum(map(len,selected.values())),artworkViews=len(artworks),terrainPlans=evidence),ensure_ascii=False,indent=2)+'\n')
 print(f'{len(selected)} locations; {sum(map(len,selected.values()))} views; {len(artworks)} artwork views; {len(plans)} terrain plans')
if __name__=='__main__':main()
