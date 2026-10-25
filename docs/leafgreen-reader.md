# LeafGreen Reader — v0.27.0

This is milestone 1 of the [LeafGreen expansion](leafgreen-implementation-plan.md).
The Reader accepts original English LeafGreen raw 128 KiB battery saves. Choose
the `.sav` exported by the emulator, not a save state. Source bytes stay local
and are never persisted or uploaded.

On first import, confirm that the game is LeafGreen. FireRed and LeafGreen share
their save layout without a trustworthy version field. The selection is retained
with the Adventure Profile; matching updates use the selected game. Create a new
adventure to force a fresh selection. Cancel if the file is FireRed, a ROM hack,
another language's game, or its version is uncertain. Pokémon origin versions do
not establish the host game.

## Included

- Both rotating save slots, all fourteen logical sectors, exact structure-sized
  checksums and native unsigned counter/rollover selection. A corrupt/partial
  newer slot falls back to a complete backup; sectors from different slots or
  counters are never combined. Hall of Fame and Trainer Tower are not decoded.
- Trainer name/IDs/gender/play time, XOR-encrypted money and eight Kanto badges.
- Party and fourteen thirty-slot boxes, names/current box, native PK3 encryption,
  checksum, species mapping, names, moves/PP/PP Ups, held items, ability slot,
  IVs/EVs, nature, shiny/gender, friendship, origin/met history and party stats.
- Native English data, plus Pokémon-record Japanese text for traded Pokémon and
  Eggs within the supported English save. English accents and Japanese characters
  use separate tables. Unown form comes from PID; Deoxys uses LeafGreen Defense
  form. PK3 has no persistent form byte or met/egg date fields.
- Kanto 151 / National 386 registration counts and separate party/PC ownership.
  Counts follow the native three-copy Seen consensus; Caught also requires Seen.
  National unlock requires the native magic, event flag and variable together.
  Profiles retain LeafGreen's fourteen boxes and reject later-generation IDs.
- Existing shared menu/themes, phone/desktop Party/PC views, profile updates and
  decoded restoration. Native metadata is local; LeafGreen does not require an
  external metadata API.

Evolution/save export, LeafGreen reference Pokédex and the LeafGreen Atlas are
subsequent expansion milestones. No Gen IV evolution action is offered for a
LeafGreen Pokémon. Existing SoulSilver and Platinum references remain available
in their own game scope. LeafGreen progress does not update the SoulSilver Team
Planner's EV snapshot, Johto Safari or Platinum Great Marsh.

## Evidence and reproduction

Primary: pret/pokefirered
`ce6406d8c2eaf46d543c8a2606de0c3cb1951982`. The factual generated tables include
386 National species and 355 move IDs including zero. The source ledger records
each input's URL/hash: [leafgreen-reader-sources.json](leafgreen-reader-sources.json).
Rebuild offline from a clean pinned checkout:

```sh
python scripts/build-leafgreen-reader.py /path/to/pokefirered
```

Independent: PKHeX
`9c3391d017d91ba407ef53075b15581f1bec8f0d`, .NET 10. The optional C# harness is
development-only and links an external PKHeX.Core checkout; its library is not
bundled into the website. PKHeX independently generates 434 encrypted PK3 vectors
(all species, all 24 permutations and high-bit keys) and independently reads a
complete synthetic fixture's trainer, party and occupied PC fields. Tests replay
the committed raw records/observations without requiring .NET.

```sh
dotnet build scripts/leafgreen-reference/Reference.csproj -p:PKHeXProject=/path/to/PKHeX/PKHeX.Core/PKHeX.Core.csproj
dotnet scripts/leafgreen-reference/bin/Debug/net10.0/Reference.dll records > /tmp/leafgreen-records.json
node -e "require('fs').writeFileSync('/tmp/leafgreen.sav',require('./tests/fixtures/gen3.cjs').save())"
dotnet scripts/leafgreen-reference/bin/Debug/net10.0/Reference.dll inspect /tmp/leafgreen.sav > /tmp/leafgreen-inspect.json
node scripts/audit-leafgreen-reader.mjs --records-in /tmp/leafgreen-records.json --save-in /tmp/leafgreen-inspect.json
node scripts/audit-leafgreen-reader.mjs
npm run validate:atlas
```

The [independent report](leafgreen-reader-independent.json) explicitly resolves
native Air Lock ID 77 versus PKHeX's normalized 76, the native empty second-ability
slot versus PKHeX's display fallback, and effective Deoxys form versus raw PK3's
absent form field. The production parser follows native data; comparison mappings
are explicit. No game rule is inferred solely from an editor's presentation.

Fixtures and comparisons are synthetic, not real-save or in-game validation.
Supported containers are raw 128 KiB LeafGreen battery saves; 64 KiB truncations,
emulator save states and unverified GBA container suffixes are rejected. Other
languages' host saves, FireRed, hacks, full legality checking, linked battles,
Hall of Fame and Trainer Tower are outside this Reader milestone.

The full release gate passes **306/306 checks**, with zero skips/failures and zero
mandatory integrity failures. Both generated LeafGreen outputs rebuild byte for
byte. Existing 114 Platinum exports retain their independently observed hashes;
that report explicitly records reuse of the same byte-identical observations.
Release `0e7c076` is published on the existing
[Reader site](https://thedraconicpanda.github.io/pokemon-reader/).
[Pages run 40237758274](https://github.com/TheDraconicPanda/pokemon-reader/actions/runs/40237758274)
completed successfully. The separate
[CI run 40237758627](https://github.com/TheDraconicPanda/pokemon-reader/actions/runs/40237758627)
records GitHub's post-publication checks. User acceptance and real-save/in-game
validation remain pending.
