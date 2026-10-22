# Platinum evolution and export — milestone 3

The shared Reader now exports validated evolution simulations for Platinum and
SoulSilver. Raw saves and recognized DeSmuME containers keep their original format
and extension. Export creates a separate download and never updates the loaded
Adventure Profile automatically.

## Verified Platinum scope

| Path | Rules |
| --- | ---: |
| Trade | 4 |
| Trade holding an item | 13 |
| Mt. Coronet / Moss Rock / Ice Rock level-up trigger | 4 |
| Known-move level-up trigger | 7 |
| Held-item daytime/nighttime trigger | 3 |
| Friendship trigger | 14 |
| Beauty trigger | 1 |
| Remoraid in the party | 1 |
| Total | 47 |

Rules are generated from the pinned Platinum species data by
`scripts/build-platinum-reader.py`; `platinum-evolution-rules.js` interprets the
supported methods. `tests/fixtures/gen4/evolution-vectors.json` independently
specifies every expected relationship and prerequisite.

Eggs, missing/wrong items and moves, absent party companions, insufficient
friendship/Beauty, unsupported source forms and level-100 level-up triggers are
rejected. Trade at level 100 remains available. Everstone blocks evolution except
Kadabra's verified Generation IV trade exception. Spiky-eared Pichu cannot enter
Platinum and is rejected by this simulator. A time-dependent trigger requires an
explicit simulated day/night selection; the host computer clock is not used.

The existing simulation model is retained: a level-up trigger leaves level,
experience and moves unchanged. Location choices describe the simulated location,
not a decoded player position. SoulSilver's existing unavailable-location
simulation remains explicitly labelled as a D/P/Pt trigger. Ordinary level-up
and Bag-stone evolutions remain in-game operations, as in the original Reader.

No actual exchange occurs. Original Trainer identity, ownership, friendship,
met history, ribbons, training and move data are preserved. The appropriate held
item is consumed; the simulator does not invent communication, trade counters,
outsider status or a friendship reset.

## Shared transaction

`evolution-transaction.js` re-detects the source from bytes, resolves the selected
occupied record in its validated block, checks checksum/identity/current moves,
and derives prerequisites from that record and the actual party. It never trusts
presentation offsets or a caller-supplied party as authority.

Both games share PK4 decryption, encryption, checksum and party-stat code. Native
attributes are recalculated: PID-based ability, target-species gender, default
nickname in the **current save's language**, party stats and HP with existing
lost HP/fainting/status preserved. Existing nicknames are retained. Seen/caught
and gender registrations are updated. Correct general/storage block CRCs are
recomputed, including different Platinum copies when selected.

The result is reloaded and checked before export. Identity, moves, EVs, IVs and
unrelated logical PK4 bytes must remain unchanged; only the selected evolution's
fields, party stats, registrations and required checksums may change. Invalid
output never reaches the download. SoulSilver now uses this same transaction,
including correct ability/default-name/Dex updates; the legacy facade remains
byte-compatible with captured pre-refactor fixtures for existing consumers.

## Container and filename handling

Recognition follows pinned PKHeX `SaveHandlerDeSmuME`: 0x80000 raw bytes plus a
0x7A-byte footer ending in `|-DESMUME SAVE-|`. Unknown trailing data is not blindly
stripped. Every recognized footer byte is preserved exactly after edits.

`example.sav` exports as `example.evolved.sav`; `example.DSV` becomes
`example.evolved.DSV`. Re-editing `example.evolved.sav` produces
`example.evolved-2.sav`, so the output name always differs from its input.
The uploaded file is read-only, and original bytes/snapshots remain intact.

## Independent evidence and repeatability

Pinned references:

- [Platinum evolution predicates](https://github.com/pret/pokeplatinum/blob/49f78f35ccd8c6880e189d23a630eef2976c44ac/src/pokemon.c#L3530)
- [Native evolution attribute updates and held-item consumption](https://github.com/pret/pokeplatinum/blob/49f78f35ccd8c6880e189d23a630eef2976c44ac/src/evolution.c)
- [PKHeX PK4](https://github.com/kwsch/PKHeX/blob/a9ff30657073b26825929a65ef58e61f99a1fe6f/PKHeX.Core/PKM/PK4.cs)
- [PKHeX DeSmuME recognition](https://github.com/kwsch/PKHeX/blob/a9ff30657073b26825929a65ef58e61f99a1fe6f/PKHeX.Core/Saves/Util/Recognition/SaveHandlerDeSmuME.cs)
- [Gen IV default name formatting](https://github.com/kwsch/PKHeX/blob/a9ff30657073b26825929a65ef58e61f99a1fe6f/PKHeX.Core/PKM/Util/SpeciesName.cs)
- [Secondary cross-check: trade exceptions and Gen IV naming semantics](https://bulbapedia.bulbagarden.net/wiki/Trade)

The committed [independent whole-save report](platinum-evolution-independent.json)
contains **114 complete exports read by PKHeX**, their SHA-256s, valid block
checksums, selected Pokémon attributes and independent seen/caught/gender flags.
These cover 56 positive vectors (all 47 rules, seven language cases and trade
edge cases), party and PC, plus DSV samples. Twelve negative vectors cover
blocked conditions. Complete logical PK4 bytes match independently generated
PKHeX expectations, including protected fields, not just species IDs.

Normal Node tests reproduce exports and compare their hashes to those actually
inspected by PKHeX. They also verify writer/data input fingerprints, all unrelated
save bytes, original-source immutability, native default names, and browser
profile preservation/download behavior. No .NET or network is needed for those
fixture tests; Chromium integration needs a local listening socket.

To repeat the optional external gate with the pinned PKHeX checkout and .NET 10:

```sh
dotnet build scripts/pkhex-reference/Reference.csproj -c Release -p:PKHeXProject=/path/to/PKHeX/PKHeX.Core/PKHeX.Core.csproj
node scripts/audit-platinum-evolutions.mjs --exports /tmp/platinum-exports
dotnet scripts/pkhex-reference/bin/Release/net10.0/Reference.dll batch /tmp/platinum-exports > /tmp/platinum-observations.json
node scripts/audit-platinum-evolutions.mjs --verify /tmp/platinum-observations.json
node --test tests/platinum-evolution.test.cjs
```

Use a fresh exports directory. The harness also supports `evolutions VECTORS
ORACLE.json` and `names RUNTIME.js EXPECTED.json` to rebuild the independent record
and seven-language name fixtures. No PKHeX binaries or implementation source are
bundled into the application; generated outputs are factual names/identifiers,
native encodings and numeric test records, with upstream provenance retained.

## Character-source discrepancies

All **3,451 native names** (493 × seven Gen IV languages) are checked against
PKHeX's decoded expectations. That audit exposed and resolved:

- A legacy ASCII lowercase range that incorrectly swallowed accented capitals.
- Legacy punctuation entries that mapped weather/gender symbols to unrelated text.
- The primary charmap's visual aliases for full-width gender/prolonged-sound marks.
- A missing reserved Korean 0x400 entry in the primary charmap, shifting only the
  first fifteen Korean glyphs; later rows already had correct indices.

The generator records the exact normalized code ranges and pinned PKHeX reference
in [the source ledger](platinum-reader-sources.json). Encoded bytes use PKHeX's
native Gen IV strings; canonical Unicode is verified independently. Unknown codes
remain `�` rather than invented text.

## Remaining scope and limitations

Fixtures are synthetic; real player saves and emulator/in-game outcomes are not
claimed. The simulator does not perform move-learning dialogs, Bag-stone edits,
Pokétch history updates, score/event-counter changes or communication. Unrelated
records and bytes remain preserved. Unsupported source forms/languages fail
explicitly rather than producing guessed edits. Platinum reference Pokédex,
Sinnoh Atlas and Great Marsh remain later milestones.

## Release gate — 0.26.2

`npm run validate:atlas` passes **259/259** automated tests with zero mandatory
failures and unchanged 100% existing Johto/Kanto location coverage. Reader,
Planner, Pokédex, Atlas, Safari and both game fixtures pass. The independently
inspected export hashes and writer input fingerprints match the committed
fixtures. Publication status is recorded separately from these local checks.
