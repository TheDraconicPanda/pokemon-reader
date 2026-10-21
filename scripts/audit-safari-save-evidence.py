"""Verify and record Safari read-only field evidence; no personal save input.
Usage: python scripts/audit-safari-save-evidence.py
Expects the pinned research checkouts under work/ as documented in the field guide.
"""
import hashlib,json,pathlib,re,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[1]
repos={
 'primary':('work/safari-primary','pret/pokeheartgold','d2355244ac42b3c6e40d8c36aa3564ee8706dea4'),
 'pkhex':('work/safari-pkhex','kwsch/PKHeX','0a7854f64e118ad228513f3cf4b84c308dac2fdc'),
 'editor':('work/safari-editor-reference','Yoyovicti/HGSS_SafariZoneEditor','9b06bd854172599d81d89b8979aa00ac8ddee063'),
 'pksm':('work/safari-pksm-reference','FlagBrew/PKSM-Scripts','9b744f76c7b14089b45323c2cf1cb5493a3837ee')}
ledger={'sources':{},'realSaveFixtures':0,'validation':'Source-verified offsets and synthetic checksummed fixtures; no real-save validation claimed.'}
def read(repo,name):
 path,remote,revision=repos[repo];path=ROOT/path
 assert subprocess.check_output(['git','-C',str(path),'rev-parse','HEAD'],text=True).strip()==revision
 subprocess.run(['git','-C',str(path),'diff','--exit-code',revision,'--',name],check=True,stdout=subprocess.DEVNULL)
 body=(path/name).read_bytes();ledger['sources'][f'{repo}/{name}']={'url':f'https://github.com/{remote}/blob/{revision}/{name}','sha256':hashlib.sha256(body).hexdigest()};return body.decode()
gear=read('primary','include/save_pokegear.h')
assert 'phoneContacts[NUM_PHONE_CONTACTS]; // 60C' in gear and 'size=0x658' in gear
hexfile=read('pkhex','PKHeX.Core/Saves/SAV4HGSS.cs');read('pkhex','PKHeX.Core/Saves/SAV4.cs')
assert 'OFS_GearRolodex = 0xC0EC' in hexfile and 'EventWork => 0xDE4' in hexfile
read('primary','src/save.c');arrays=read('primary','src/save_arrays.c')
assert arrays.index('SAVE_POKEGEAR,')<arrays.index('SAVE_SAFARI_ZONE,')<arrays.index('SAVE_PHOTO_ALBUM,')
header=read('primary','include/safari_zone.h');read('primary','include/constants/safari.h');read('primary','src/safari_zone.c');read('primary','src/unk_02097268.c')
for marker in ['u8 area_no;','u8 active_object_count;','u8 areaLevels[NUM_SAFARI_ZONE_AREAS];','u8 objectUnlockLevel : 6;','u8 unk5F9_6 : 2;']:assert marker in header
editor=read('editor','include/manager/save_data_manager.hpp')
assert 'OFFSET_SLOTS = 0xC13C' in editor and 'OFFSET_DAY_COUNTERS = 0xC418' in editor and 'SLOT_SIZE = 0x7A' in editor
read('primary','include/save_vars_flags.h');read('primary','src/save_vars_flags.c');read('primary','src/sys_vars.c');read('primary','files/fielddata/script/scr_seq/scr_seq_0119_D47R0101.s');read('primary','include/player_data.h')
pksm=read('pksm','src/scriptsHGSS.txt');assert '"Max all Safari Zone object levels" -i 0xC148' in pksm
gear_base=0xC0EC-0x60C;safari_base=gear_base+((0x658+3)&~3)+4
assert safari_base==0xC13C
area_size=2+30*4;area_set_size=area_size*6+12
assert area_size==0x7A and area_set_size==0x2E8
leader_size=8+8+4+4+16;pending_offset=2*area_set_size+leader_size
assert pending_offset==0x5F8
ledger['fieldOffsets']={'zoneBase':hex(safari_base),'slotStride':hex(area_size),'areaAges':hex(safari_base+6*area_size),'baobaStage':hex(0xDE4+2*(0x4057-0x4000)),'pendingDays':hex(safari_base+pending_offset),'packedUnlockAndActiveSet':hex(safari_base+pending_offset+1)}
ledger['derivation']=['Pokégear base = PKHeX caller offset 0xC0EC - primary caller-field offset 0x60C = 0xBAE0.','Safari base = 0xBAE0 + aligned primary Pokégear size 0x658 + save-substructure trailer 4 = 0xC13C.','Dedicated HGSS editor independently supplies 0xC13C, 0x7A stride and 0xC418 counters.','6 * (2 + 30 * 4) = 0x2DC bytes before the twelve area counters.','Two 0x2E8-byte sets plus 0x28-byte link-leader data place pending days at +0x5F8 and the packed unlock/selection byte at +0x5F9.','PKHeX event-variable base 0xDE4 + 2 * (0x4057 - 0x4000) = 0xE92.']
ledger['disagreement']={'source':'PKSM-Scripts src/scriptsHGSS.txt','claimedCounterOffset':'0xC148','resolution':'Not used: inconsistent with primary structure and both independent base/stride derivations. 0xC148 lies inside the first area object record storage, while area counters begin at 0xC418.'}
(ROOT/'docs/safari-save-sources.json').write_text(json.dumps(ledger,indent=2)+'\n');print(ledger['fieldOffsets'])
