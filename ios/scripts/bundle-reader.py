#!/usr/bin/env python3
"""Build an audited offline copy; production Reader sources are never edited."""
import argparse,hashlib,json,pathlib,shutil,zipfile
ROOT=pathlib.Path(__file__).resolve().parents[2]
def build(destination):
    destination=pathlib.Path(destination).resolve()
    if not destination.is_relative_to(ROOT/'work'):
        raise ValueError('Bundle output must stay in repository work/.')
    if destination.exists():shutil.rmtree(destination)
    destination.mkdir(parents=True)
    for name in ['index.html','README.md','js','css','assets','team-planner','pokedex','pokedex-earth','safari-zone','docs']:
        source=ROOT/name
        if source.is_dir():shutil.copytree(source,destination/name)
        else:shutil.copyfile(source,destination/name)
    native=destination/'native';native.mkdir()
    for source in (ROOT/'ios/Web').glob('*'):
        if source.suffix in ['.js','.json']:shutil.copyfile(source,native/source.name)
    art=json.loads((ROOT/'ios/Web/shiny-manifest.json').read_text())
    archive=ROOT/'ios/Web/shiny.zip'
    if hashlib.sha256(archive.read_bytes()).hexdigest()!=art['archiveSHA256']:raise ValueError('Shiny archive integrity failed.')
    with zipfile.ZipFile(archive) as package:
        for entry in package.infolist():
            # Archive is data only; never extract paths supplied by a ZIP.
            name=pathlib.PurePosixPath(entry.filename).name
            if name!=entry.filename or not name.endswith('.png'):raise ValueError('Unexpected artwork entry.')
            data=package.read(entry)
            expected=art['files'][name.removesuffix('.png')]
            if hashlib.sha256(data).hexdigest()!=expected:raise ValueError(f'Artwork integrity failed: {name}')
            target=destination/'assets/pokemon/hgss/shiny'/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
    def replace(path,old,new):
        target=destination/path;text=target.read_text()
        if text.count(old)!=1:raise ValueError(f'Overlay no longer matches {path}: {old[:70]}')
        target.write_text(text.replace(old,new))
    replace('js/app.js','initializeAdventures();','const nativeInitialization = initializeAdventures();')
    replace('js/app.js','return fetch(url, { signal: AbortSignal.timeout(8000) });','return nativeMetadata(url);')
    replace('js/app.js','`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.id}.png`','hgssSprite(entry.id)')
    replace('js/species-presentation.js','`https://raw.githubusercontent.com/PokeAPI/sprites/7a7d66b1620e646f69afd48dc1273da9033ede9c/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/shiny/${speciesId}.png`','new URL(`assets/pokemon/hgss/shiny/${speciesId}.png`, root).href')
    with (destination/'js/app.js').open('a') as output:
        output.write('''
// Native-only overlay: retained cartridge snapshots are read-only.
import { nativeMetadata } from '../native/offline.js';
import { installNativeReader } from '../native/bridge.js';
installNativeReader({initialized:nativeInitialization,choose:chooseAdventure,refresh:refreshProfiles,clear:resetFileInfo,
  render:async result=>{
    resetFileInfo();const revision=loadRevision;
    currentSaveBytes=null;currentActivePartition=null;
    await renderDecodedSave(result,revision);
    if(revision!==loadRevision)return;
    document.querySelector('.app').dataset.saveLoaded='true';
    document.querySelector('.app').setAttribute('aria-busy','false');
    fileStatus.className='status success';fileStatus.textContent='Read-only completed in-game save.';
    adventureStatus.textContent='Adventure stored in this app. Import a separate file to create a modified export; exports never replace the active cartridge.';
  }
});
''')
    for html in destination.rglob('*.html'):
        if html.is_relative_to(destination/'docs'):continue
        text=html.read_text()
        if '</body>' in text:html.write_text(text.replace('</body>','<script type="module" src="/native/host.js"></script></body>'))
    files={str(p.relative_to(destination)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(destination.rglob('*')) if p.is_file()}
    manifest={'nativeVersion':'0.4.0','readerBaseVersion':json.loads((ROOT/'package.json').read_text())['version'],'files':files}
    (destination/'BundleInfo.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(f'Offline Reader: {len(files)} files, {sum(p.stat().st_size for p in destination.rglob("*") if p.is_file())} bytes')
if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('destination');build(parser.parse_args().destination)
