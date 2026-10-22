const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFile}=require('node:fs/promises');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const root=path.join(__dirname,'..');
const load=async()=>{
  const {locationDetails,locationDetailSearchText}=await import(pathToFileURL(path.join(root,'js/data/atlas-location-reference.js')).href);
  const {ATLAS_LOCATIONS}=await import(pathToFileURL(path.join(root,'js/data/atlas-locations.js')).href);
  return {locationDetails,locationDetailSearchText,ATLAS_LOCATIONS};
};

test('structured references account for every current non-Safari location and retain source provenance',async()=>{
  const {locationDetails,ATLAS_LOCATIONS}=await load();
  const audit=JSON.parse(await readFile(path.join(root,'docs/atlas-location-details-audit.json'),'utf8'));
  const names=ATLAS_LOCATIONS.filter(l=>l.name!=='Safari Zone'&&!l.audit.primaryRevision).map(l=>l.name);
  assert.equal(names.length,69);assert.deepEqual(Object.keys(audit.locations).sort(),names.sort());
  const counts={items:0,gifts:0,offers:0,services:0,trainers:0};
  for(const name of names){
    const d=locationDetails('soulsilver',name);assert.equal(d.status,'reviewed');
    const ids=new Set();
    for(const key of Object.keys(counts)){
      assert.equal(d[key].length,audit.locations[name][key],name+': '+key);counts[key]+=d[key].length;
      if(!d[key].length)assert.ok(d.emptyNotes[key],name+': explicit empty '+key);
      for(const record of d[key]){
        assert.ok(record.name);assert.ok(record.id);assert.ok(!ids.has(record.id),name+': duplicate '+record.id);ids.add(record.id);
        assert.ok(Array.isArray(record.conditions));assert.ok(d.sources.includes(record.source));
        assert.ok(['bulbapedia.bulbagarden.net','github.com'].includes(new URL(record.source).hostname));
        if(key==='trainers'){
          assert.ok(!record.name.includes('*'),'No unexplained/unused trainer markers');
          assert.ok(record.party.length<=6);assert.ok(record.party.length||record.role==='facility');
          for(const member of record.party)assert.match(member,/Lv\.\s*\d/);
        }
      }
    }
  }
  assert.deepEqual(counts,audit.counts);
  assert.ok(counts.items>600&&counts.gifts>=22&&counts.trainers>300);
  assert.equal(audit.references.every(r=>r.status===200&&/^[a-f0-9]{64}$/.test(r.sha256)),true);
});

test('SoulSilver gift, trade and regional restrictions remain explicit',async()=>{
  const {locationDetails:d}=await load();
  const gift=(place,name)=>d('soulsilver',place).gifts.find(g=>g.name===name);
  assert.equal(gift('Violet City','Togepi').level,'1');assert.equal(gift('Violet City','Togepi').kind,'egg');
  for(const name of ['Mareep','Wooper','Slugma'])assert.match(gift('Violet City',name).conditions.join(' '),/Trainer-ID.*language/);
  assert.match(gift('Violet City','Onix').conditions.join(' '),/Bellsprout.*Persim Berry/);
  assert.match(gift('Blackthorn City','Dodrio').conditions.join(' '),/female Dragonair/);
  assert.match(gift('Olivine City','Steelix').conditions.join(' '),/Jasmine.*number/);
  assert.match(gift('Cianwood City','Tentacool').conditions.join(' '),/one party.*540 PC/);
  assert.match(gift("Dragon's Den",'Dratini').conditions.join(' '),/perfect first quiz/);
  const prizes=d('soulsilver','Goldenrod City').gifts.filter(g=>g.kind==='prize');
  assert.deepEqual(prizes.map(g=>g.name),['Abra','Sandshrew','Dratini']);
  assert.ok(d('soulsilver','Goldenrod City').items.some(i=>i.name==='TM78 (Captivate)'&&i.location.includes('Japanese version')));
  assert.match(gift('Ilex Forest','Spiky-eared Pichu').conditions.join(' '),/Historical event/);
});

test('primary-evidence corrections and daily reward gates survive the structured pass',async()=>{
  const {locationDetails:d}=await load();
  const items=(n)=>d('soulsilver',n).items;
  assert.ok(items('Route 26').some(i=>i.name==='Max Elixir'));assert.ok(!items('Route 26').some(i=>i.name==='PP Max'));
  const contest=items('National Park').filter(i=>i.location.includes('first prize after'));
  assert.equal(contest.length,10);assert.ok(contest.some(i=>i.name==='Oval Stone'));
  assert.ok(contest.every(i=>i.source.endsWith('src/overlay_bug_contest.c')));
  const ruin=items('Ruins of Alph');
  assert.ok(ruin.some(i=>i.location.includes('Kabuto chamber · use an Escape Rope')));
  assert.ok(ruin.some(i=>i.location.includes('Aerodactyl chamber · use Flash')));
  assert.ok(ruin.some(i=>i.location.includes('Ho-Oh anywhere')));
  assert.ok(ruin.some(i=>i.location.includes('Omanyte chamber · use a Water Stone')));
  const sunday=items('Goldenrod Department Store').filter(i=>/^TM(?:21|27) /.test(i.name));
  assert.equal(sunday.length,2);assert.ok(sunday.every(i=>i.location.includes('once per save')));
  assert.ok(d('soulsilver','Pokéathlon Dome').offers.some(i=>i.name==='Shiny Stone'&&i.location.includes('Monday')&&i.conditions.includes('National Pokédex')));
  assert.ok(d('soulsilver','Battle Frontier').offers.some(i=>i.name==='TM89 (U-turn)'));
  assert.ok(d('soulsilver','Battle Frontier').offers.every(i=>!i.location.includes('Platinum')));
  assert.ok(d('soulsilver','Goldenrod Department Store').offers.every(i=>!i.location.includes('Rooftop Lookout')));
  assert.ok(!items('New Bark Town').some(i=>i.name.includes('Doll')));
});

test('playable trainer variants and allies stay attached to their actual locations',async()=>{
  const {locationDetails:d}=await load();
  const t=n=>d('soulsilver',n).trainers;
  assert.equal(t('Cherrygrove City').filter(x=>x.name==='Passerby Boy').length,3);
  assert.ok(t('Cherrygrove City').every(x=>x.conditions.some(c=>c.includes('player chose'))));
  assert.ok(t('Sprout Tower').find(x=>x.name==='Elder Li').party.includes('Hoothoot ♂ Lv. 10'));
  assert.equal(t('Indigo Plateau').filter(x=>x.name==='Elite Four Will').length,2);
  assert.ok(!t('Indigo Plateau').some(x=>x.area==="Dragon's Den"||x.area==='Team Rocket HQ'));
  assert.equal(t("Dragon's Den").filter(x=>x.role==='ally').length,3);
  assert.ok(t('Team Rocket HQ').some(x=>x.name==='Pokémon Trainer Lance'&&x.role==='ally'));
  assert.ok(!t('National Park').some(x=>x.name==='Pokéfan Beverly'&&x.conditions.some(c=>c.includes('Rematch'))));
  assert.match(t('Tohjo Falls')[0].conditions.join(' '),/Historical promotional Celebi/);
  assert.equal(t('Battle Frontier').filter(x=>x.role==='facility').length,5);
});

test('future games do not inherit SoulSilver details and new content is searchable',async()=>{
  const {locationDetails:d,locationDetailSearchText:search}=await load();
  for(const game of ['heartgold','platinum','__proto__',undefined]){assert.equal(d(game,'Violet City'),null);assert.equal(search(game,'Violet City'),'');}
  assert.equal(d('soulsilver','Safari Zone'),null);assert.equal(d('soulsilver','__proto__'),null);
  assert.match(search('soulsilver','Mt. Mortar'),/Tyrogue.*Kiyo/);
  assert.match(search('soulsilver','Goldenrod Department Store'),/Machop/);
  assert.ok(!search('soulsilver','New Bark Town').includes('https://'));
});
