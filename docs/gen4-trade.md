# SoulSilver ↔ Platinum Trade — v0.27.5

Use **Trade** in the shared menu, or open `trade/`. Load one save of each game,
select one party Pokémon on each side, review incoming species/items and any
move-learning choices, then prepare and download **both** updated saves. Restore
both outputs to the respective games; importing only one does not complete an
exchange. Original uploads and Adventure Profiles are never overwritten. Reload
the resulting saves in Reader to refresh profiles, or in Trade for another trade.
All processing is local. Raw 512 KB saves and supported DeSmuME `.dsv` containers
are supported, with unchanged container footers and distinct output names.

## Scope and rules

This release implements the Generation IV local communication-room exchange
between one SoulSilver and one Platinum save, in either orientation. Same-game
pairs and all other games are outside this agreed release. PC Pokémon must first
be moved into the party in-game. Both saves must have obtained their Pokédex.
Each outgoing selection must leave another non-Egg in that party; this matches
the native trade-room check, which does not substitute the incoming Pokémon when
checking the retained party. No National Dex, League completion or species-native
to-region restriction is invented. Korean games cannot be paired with non-Korean
games for this direct local trade route (GTS had different language behavior).

The selected party slots are exchanged; party counts, other party slots, PC
storage, historical outgoing registrations and backup save partitions stay intact.
A missing evolution item prevents that evolution, not the underlying exchange.
The correct already-held evolution item is consumed on receipt. The trade-evolving
species are Kadabra, Machoke, Graveler, Haunter, Onix, Scyther, Seadra, Slowpoke,
Poliwhirl, Porygon, Clamperl's two branches, Rhydon, Electabuzz, Magmar, Dusclops
and Porygon2 (16 source species; 17 paths including both Clamperl branches).
Everstone blocks trade evolution except Kadabra. Level 100 does not block a
trade evolution. Location, friendship, move and level-up evolutions never run.
Trade evolutions cannot be cancelled; move learning can be declined when the
moveset is full, or replace a non-HM move using the receiving game's HM list.
Empty move slots learn the receiving species' current-level moves automatically.
Replacement moves start at base PP and zero PP Ups.

Received non-Egg friendship becomes 70; SoulSilver also resets mood and the
receiving party slot's Aprijuice modifiers. Original trainer identity, PID,
shiny state, IVs, EVs, origin, experience, moves/PP and held item are copied unless
the authentic receipt/evolution requires a change. Evolution recalculates native
ability, gender, default species name and party stats. Nicknames remain. Attached
Mail travels in the full party record. Ball Capsule IDs and seals are detached.
Held items must belong to the native giveable item set (not key items or HMs).
A selected non-Egg must have a species/form-valid ability; historical stale ability
bytes must be checked or repaired in Reader first. Legitimate alternate ability
slots are preserved when no evolution occurs.

Eggs are supported with preserved hatch progress, no trade evolution and no Dex
registration. Set the **receiving console date** explicitly for each receiving
Egg: the game writes this date and Link Trade (2002) as its met location, while
preserving egg-origin data and original trainer fields until hatching.

Before loading, remove Griseous Orbs and restore party Giratina, Rotom and Shaymin
to base forms in-game. The native communication entry sanitizes these; this tool
requires you to prepare the party rather than editing bags or removing form moves.
Spiky-eared Pichu anywhere in the party blocks room entry; put it in the PC.
Other native forms travel and register their forms. Seen/caught history, genders,
foreign-language registration, Spinda pattern and native packed form histories
are updated on receipt and again after evolution, without clearing old entries.

The tool trusts your acquisition history. It checks save/Pokémon integrity and
trade requirements, rather than reconstructing capture/event legality. It cannot
prevent duplication by restoring old backups. Pokémon and Pokédex effects are
simulated; ancillary communication/journal/trainer-card counters, trainer score,
Pokétch history, Chatot recording resets and special event/Pokéwalker unlocks are
not reproduced. This is not a byte-for-byte replay of every communication-room
save side effect. Keep the original saves; real-save/emulator acceptance is a
separate validation step.

## Native evidence

Research revisions (read on 2026-11-09):

- `pret/pokeheartgold`: `6bf138d6035aa6b43d6f8f4132a12df70f86dcec`.
- `pret/pokeplatinum`: `62bdaacdca6c56a6a396f3e9911e2f922b79bba8`.
- Existing personal, learnset, name and evolution data retain their previously
  pinned sources in the Reader/Pokédex datasets.

Secondary language reference: [Bulbapedia trade inter-language compatibility](https://bulbapedia.bulbagarden.net/wiki/Trade#Inter-language_trading), checked 2026-11-09.

Primary entry and receipt evidence:

- [HGSS communication entry](https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/files/fielddata/script/scr_seq/scr_seq_0004.s):
  spiky-eared Pichu party check, communication sanitization, pre-entry healing.
- [HGSS form/item sanitization](https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/src/field/scrcmd_pokemon_misc.c): `ScrCmd_CommSanitizeParty`.
- [HGSS native exchange](https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/asm/overlay_65.s):
  `ov65_0221F5A0`, friendship 70, mood zero, capsule clearing, Dex registration,
  Aprijuice slot reset, replacement of outgoing slot.
- [Platinum native exchange and party restriction](https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/src/applications/trade_room/application.c):
  `TradeRoom_ExecuteTrade`, `TradeRoom_HasUsablePartyAfterTrade`.
- [HGSS evolution predicates](https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/src/pokemon.c):
  `GetMonEvolution`, Kadabra's Everstone exception and `EVOCTX_TRADE`.
- [Platinum evolution](https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/src/evolution.c):
  ability/stats/default name updates and current-level move-learning sequence.
- [HGSS Egg trade memo](https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/src/trainer_memo.c): strategy 5.
- [Platinum Egg trade memo](https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/src/unk_02092494.c): strategy 5.
- [HGSS Dex layout](https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/include/pokedex.h),
  [HGSS capture registration](https://github.com/pret/pokeheartgold/blob/6bf138d6035aa6b43d6f8f4132a12df70f86dcec/src/pokedex.c),
  [Platinum Dex](https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/src/pokedex.c).
- [Platinum bag giveability](https://github.com/pret/pokeplatinum/blob/62bdaacdca6c56a6a396f3e9911e2f922b79bba8/src/applications/bag/main.c):
  `ITEM_PARAM_PREVENT_TOSS` gates Give. Reproduce item membership with
  `python3 scripts/build-trade-items.py work/pokeplatinum` at the revision above.

## Validation

`tests/trade.test.cjs` exercises every existing trade-evolution vector in both
receiving games, original preservation, outgoing replacement, unrelated-byte
preservation, container footers, ordinary transfers, item consumption, Everstone,
Eggs/dates, native party/form/item/language restrictions, non-trade evolution
exclusion, receiving-game move learning/HM protection and packed Dex histories.
Fixtures are constructed using existing PKHeX-generated records and the existing
synthetic SoulSilver save builder; they are not player saves. Independent record
fixtures do not constitute a new PKHeX validation of full traded saves.

The Chromium test uploads real fixture bytes through the Trade file inputs,
selects both party members, previews evolution, prepares and reads both actual
Blob downloads, checks the production subpath/shared menu and phone/desktop fit,
and verifies invalid replacement clears stale downloads. The existing mandatory
Atlas audit also runs Reader, Planner, Atlas, Safari, Pokédex and save regressions.
Real-save playthrough and user outcome acceptance remain pending.

Focused pre-release results: 11 transaction/data tests passed, and the Chromium
exchange/download test passed at 320, 390 and 1440 px. Light/dark screenshots were
reviewed at phone and desktop sizes. The complete release audit is recorded in
`docs/atlas-coverage.json`; no fresh independent PKHeX full-save inspection or
actual emulator playthrough is claimed.

On the managed two-core cloud runner, the full release audit uses
`ATLAS_TEST_TIMEOUT_MS=900000 ATLAS_TEST_CONCURRENCY=2 BROWSER_TEST_WAIT_MS=180000 npm run validate:atlas`.
These settings extend waiting budgets without skipping checks or changing
assertions. The applied budgets are recorded in the generated report. Default
CI budgets remain unchanged.

Final full release gate: **322/322 automated checks passed**, zero mandatory
Atlas integrity failures. The existing independently inspected evolution writer
inputs remain unchanged. Original-trainer identity is preserved, so the games
apply outsider experience and obedience normally; no badges or obedience
exemptions are granted. Publication and real-save acceptance are separate checks.

## Publication

Feature commit `10addbe2e483e3653df52f8465c833c247bb589f` was published to
`main`. [Pages build and deployment 42704390989](https://github.com/TheDraconicPanda/pokemon-reader/actions/runs/42704390989)
completed successfully on 2026-11-09, including the deploy job.
The production tool is <https://thedraconicpanda.github.io/pokemon-reader/trade/>.
Direct live HTTP verification was blocked by the managed runtime proxy (403);
this is distinct from the verified successful Pages deployment and the local
production-subpath browser tests. Real-save and in-game/user acceptance remain
pending.
