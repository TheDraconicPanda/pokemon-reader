# Pokémon LeafGreen expansion — phase 27

Status: Reader milestone technically validated and published (0.27.0 / `0e7c076`).
Pages run 40237758274 succeeded. User and real-save acceptance remain pending.
Remaining evolution/export, reference Pokédex, Atlas and final expansion audit are
not yet implemented. All 306 release checks pass without skips or failures.
Baseline: `08ff2d9690603300ef20308e67c6e546826deb2a`, application 0.26.6.
Branch: `feature/leafgreen-expansion` in the existing checkout.

## Agreed scope and workflow

The user selected parity with Platinum through complete milestones: Reader,
evolution/export, Pokédex, and a full game-specific Atlas. Target original English
LeafGreen first; FireRed, other languages and ROM hacks are outside this release.
The user's request supersedes historical restrictions against adding another game.
Routine online research, commits, non-force integration/pushes and existing Pages
deployment are authorized. Ask about material implementation choices. Summarize
the command/action and purpose before any required permission request.

Do not stop for routine milestone approval. Validate each complete milestone,
publish through the existing main/Pages workflow, and distinguish successful
deployment, synthetic validation, real-save testing and user acceptance.

## Architecture findings

- Current dispatch, Pokémon decoding/writing and container support are Generation
  IV specific. LeafGreen needs separate Generation III sector, PK3 and text codecs.
  Reuse presentation and mathematical utilities only where rules are verified.
- Save data rotates fourteen logical sectors within each of two physical slots.
  Reassemble by sector ID, checksum and coherent counter; do not assume fixed
  addresses, mix slots, or accept a partial newer save over a complete backup.
- Small/large/storage lengths are 0xF24 / 0x3D68 / 0x83D0. PC storage has fourteen
  boxes of thirty 80-byte records. Party records are 100 bytes. Snapshot validation
  currently hardcodes eighteen boxes and Gen IV species/move maxima.
- FRLG has no dedicated LeafGreen version field. PKHeX exposes a mutable Version
  selection. Traded Pokémon origin values cannot identify the host game. Proposed
  decision: confirm LeafGreen on import and retain that selection per profile;
  user approved this approach. Existing matching LeafGreen profiles retain the
  selection; new profiles ask before loading.
- Reader enrichment, badges, abilities, moves, item IDs, locations, evolution,
  Pokédex links and profile restoration require explicit LeafGreen adapters.
  Do not use the SoulSilver Kanto dataset for LeafGreen.
- Keep Team Planner, Johto Safari and Great Marsh game-scoped. LeafGreen Safari
  encounters belong to its Atlas; a separate capture simulator is not implied by
  Platinum parity and needs an explicit scope decision if requested.

## Milestones and acceptance gates

1. **Generation III foundation and Reader.** Verified rotating sectors, backup
   selection, bounded sizes, checksums, native PK3/text/species IDs, trainer,
   badges/money, party, 420 PC slots and registration/ownership. Explicit game
   selection and profile isolation; read-only source bytes. Early/middle/postgame,
   rotation, rollover, partial/corrupt, traded/egg/shiny and PP/IV/EV cases; compare
   independently with pinned PKHeX. Preserve both existing games and all tools.
2. **Evolution and export.** LeafGreen-native rules, explicitly scoped simulated
   trade triggers, native abilities/stats and encrypted records; transactional
   sector updates and checksums. Download a separate save; never modify the source.
   Independent PKHeX checks, exact unrelated-byte preservation and reload tests.
   Decide supported GBA emulator containers from evidence before promising them.
3. **Pokédex.** Native 151-entry Kanto / 386-entry National data, Generation III
   types, forms, abilities, evolutions, moves, learnsets/TMs/HMs/tutors and matching
   save indicators; shared renderer with no Gen IV mechanic/data fallback.
4. **LeafGreen Atlas.** Independently reviewed complete native header census,
   Kanto/Sevii/dungeons/floors, released/event distinctions, ordinary and special
   encounters, native Safari rules, verified navigation, maps/terrain references,
   access conditions, game-specific EV yields and Pokédex links. Pinned repeatable
   generators, independent encounter comparisons and failure-enforcing coverage.
   Resolve any extra LeafGreen Safari planning scope before implementing it.
5. **Integrated release.** All three games, profile switching, save corruption,
   export/reload, mobile/desktop, unchanged existing Safari/Marsh/Planner tools,
   reproducible sources and independent evidence. Update documentation/version,
   fetch/integrate main normally, push and verify CI/Pages separately. Keep manual
   and real-save validation limits explicit.

## Research evidence

Primary: pret/pokefirered `ce6406d8c2eaf46d543c8a2606de0c3cb1951982`.
The project contains both released versions, selected by build configuration.

- `include/save.h`: 0x1000-byte sectors, 0xF80-byte data capacity, footer at
  0xFF4 (ID/checksum/signature/counter), signature 0x08012025.
- `src/save.c`: structure-sized checksum inputs, rotation, backup selection and
  counter rollover. Sum little-endian u32 words with u32 overflow, then add the
  high and low halves and truncate to u16.
- `include/global.h`: SaveBlock2 (0xF24), SaveBlock1 (0x3D68), trainer, encryption
  key, party, flags and registration offsets.
- `include/pokemon_storage_system.h`: fourteen boxes; structure aligned to
  0x83D0 bytes, box data begins at byte 4 despite the member's preceding u8.
- `include/pokemon.h` / `src/pokemon.c`: native PK3 structures and encryption.

Independent: kwsch/PKHeX `9c3391d017d91ba407ef53075b15581f1bec8f0d`,
`PKHeX.Core/Saves/SAV3FRLG.cs`: native buffer sizes and mutable FR/LG selection.
Record input hashes, attribution and discrepancies as generators are introduced.
Never describe parser-generated expected output as independent evidence.

## Initial baseline

Working tree was clean. Default-sandbox `npm test` passed 25 test files and failed
two files (`atlas.browser`, `safari-audit`); this is not a passing release gate.
Browser/network-permitted rerun and direct failure investigation are in progress.
The initial audit above is historical. The Reader milestone now passes 306/306
checks, all 386 species match independent PKHeX vectors, the generated outputs
rebuild unchanged, and Pages deployment succeeded. See `leafgreen-reader.md`.
