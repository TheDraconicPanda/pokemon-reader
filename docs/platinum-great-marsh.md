# Platinum Great Marsh

The existing Atlas now opens a distinct Great Marsh encounter planner from Sinnoh
or the Great Marsh location. It does not use Johto Safari area blocks, aging,
replacement rules or the SoulSilver Safari snapshot. All six fixed areas have
native terrain plans and grass/Surf/rod tables.

## Verified rules

Platinum reads a saved 32-bit daily value. Area `n` (0–5) selects pool index
`(value >> (5*n)) & 31`. The native before/after-National pools contain 32 entries,
including repeated species. The chosen species replaces grass slots 6 and 7,
each worth 5%. Species already in ordinary slots can therefore exceed 10% total.
Pool-selection probability, encounter slot share and capture chance are distinct.

Morning/day/night replace slots 2/3 before daily selection. Surf and rod tables do
not use the daily grass replacement. Tables are shown before lead abilities and
Repel. Unknown daily state leaves **10% unknown**; the known 90% is never scaled
to 100%. The same species may be chosen in several areas. Record Mixing can change
the daily value, so the app never predicts a new day's visitors from the host clock.

A new session costs 500 and starts with 30 Safari Balls and a 500-step allowance.
The tool reports starting rules, not a fabricated remaining allowance. Its scope
is encounters and hypothetical/observed conditions, matching the existing Safari
planner's role. Capture, bait/mud battles and movement puzzles are not simulated.

## Save initialization and independence

Only a successfully validated Platinum general block initializes the planner.
`SpecialEncounter.marshDaily` is at general-relative **0x7F24**, followed by
`swarmDaily` at +4. Native structure layout puts the first HoneyTree at +0x14;
PKHeX independently anchors `OFS_HONEY` at **0x7F38** and `SwarmSeed` at **0x7F28**.
The parser uses the chosen valid backup copy, not a fixed first partition.

The optional Adventure snapshot contains only schema/status, daily value and the
National flag. Old profiles without it remain valid and show unknown state until
reloaded. Other games cannot supply it. Manual conditions never change the save
or stored Adventure. Native Gen IV names and IDs are used offline.

Executable checks include hand-transcribed 32-entry pools, six-area arithmetic
vectors, all 32 indices in all six areas, unsigned high bits, full and partial
distribution totals, time changes, rod independence, duplicate-species shares,
corrupt-copy recovery, malformed snapshot rejection, cross-game isolation and
320/1440-pixel browser flows with before/after snapshot comparison.

## References

All primary references use pret/pokeplatinum
`49f78f35ccd8c6880e189d23a630eef2976c44ac`:

- [Daily area selection](https://github.com/pret/pokeplatinum/blob/49f78f35ccd8c6880e189d23a630eef2976c44ac/src/overlay006/great_marsh_daily_encounters.c).
- [Both native pools](https://github.com/pret/pokeplatinum/blob/49f78f35ccd8c6880e189d23a630eef2976c44ac/res/field/encounters/encounters_great_marsh_lookout.json).
- [Grass/time/rod rules](https://github.com/pret/pokeplatinum/blob/49f78f35ccd8c6880e189d23a630eef2976c44ac/src/overlay006/wild_encounters.c).
- [Save structure](https://github.com/pret/pokeplatinum/blob/49f78f35ccd8c6880e189d23a630eef2976c44ac/include/struct_defs/special_encounter.h).
- [PKHeX Platinum anchors](https://github.com/kwsch/PKHeX/blob/a9ff30657073b26825929a65ef58e61f99a1fe6f/PKHeX.Core/Saves/SAV4Pt.cs).
- [Independent mechanics reference](https://bulbapedia.bulbagarden.net/wiki/Great_Marsh).

Reproduction: `node --test tests/great-marsh.test.cjs`, then
`npm run validate:atlas`. No real-game playthrough is claimed.
