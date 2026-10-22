# HGSS evolution abilities and SoulSilver repair — v0.26.4

The historical writer changed species at PK4 offset `0x08` but left the ability
byte at `0x15` unchanged. Seadra's Poison Point therefore survived on Kingdra.
The concurrently published v0.26.2 UI transaction already recalculated abilities;
the compatibility writer still retained the defect. Both now use the same
Generation IV resolver and checksum/encryption writer. No new evolution methods
or game support are added.

## Mechanics and evidence

[HGSS UpdateBoxMonAbility](https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/pokemon.c#L3809)
selects the second ordered species/form ability when PID bit 0 is set and the
first otherwise; an absent second slot falls back to the first. PID is preserved,
including its nature relationship. The ability ID is stored separately. There
is no independent persistent slot flag or Hidden Ability in this format.

The existing HGSS reference retains ordered abilities from pinned primary data.
`scripts/audit-hgss-abilities.mjs` verifies all 505 species/form records (493
species), including duplicated/absent second slots. Its [source URLs, hashes and
original slots](hgss-ability-evidence.json) are committed. Reproduce with the
three source files named in the script header.

| Stage | Even PID | Odd PID |
| --- | --- | --- |
| Horsea | Swift Swim | Sniper |
| Seadra | Poison Point | Sniper |
| Kingdra | Swift Swim | Sniper |

Evolution and replacement of invalid abilities follow the PID rule. Validation
accepts any stored species/form-valid ability regardless of parity, so unusual
legitimate transfers are untouched. For example, an odd-PID Gen III Porygon can
retain Trace after migration; evolution recalculates its ability. This is an
ability membership check, not a complete encounter/event or PID/IV legality audit.

## Repair instructions

1. Load the original SoulSilver save in Reader. Open **Ability validation** in
   Overview and select Kingdra, or inspect it from Party/PC.
2. Review **Poison Point → Swift Swim**, choose **Repair Ability** and confirm.
   An odd-PID Kingdra instead proposes Sniper, following the actual game rule.
3. A separate `*.ability-repaired.sav` (or the original extension, e.g. `.DSV`)
   downloads. Explicitly load that file to use the repair or make another repair.

Canceling does nothing. Original files and loaded Adventure Profiles are never
changed. Repeated export names receive numeric suffixes. Species-valid Swift
Swim/Sniper Kingdra have no repair action; repairing an already-valid record
returns unchanged bytes. Recognized DeSmuME footers are preserved exactly.

## Safety and supported scope

Repair freshly validates the SoulSilver save and matches the selected active
party/PC record using PID, species, ability, form, OT, experience and item. It
verifies the PK4 checksum, changes only logical byte `0x15`, then recalculates the
PK4 checksum, reshuffles/re-encrypts and updates the containing block CRC. Before
export, it decodes the result and checks every unrelated logical and save byte
for equality. Nature, IVs, EVs, moves, PP/PP Ups, level, stats, HP/status,
experience, items, friendship, OT, history, ribbons, other Pokémon and the
inactive backup partition remain unchanged.

Eggs are excluded. Unverified checksums, unknown species/forms or missing PID
produce uncertainty messages with no guessed replacement. Day Care, facility
and external records and Platinum ability repair are unsupported. Restored
profiles need the original save bytes to export. HGSS share these mechanics;
this does not expand the Reader's existing game detection.

Existing SoulSilver trade, held-item trade and simulated location evolutions
are covered. Ordinary level-up (Horsea → Seadra) and Bag-stone evolutions remain
in-game operations; the shared ability mapping is tested without adding methods.
Previously published Platinum evolution support remains covered by its oracle.

## Automated validation and limits

Synthetic checks cover both PID parities, every supported SoulSilver path in
party/PC, unchanged IDs, single/dual abilities, legitimate transfer mismatches,
forms and corrupt/stale/unsupported records. Repair preservation and idempotence
checks cover all 32 shuffle indices, both active partitions, party/PC and
raw/DeSmuME saves. Browser tests cover preview, cancel/confirm, separate download,
unchanged Adventure Profile, original extension and explicit reload. Phone
layouts are reviewed in both themes.

The shared writer's 114 Platinum exports replay byte-identically against existing
independent PKHeX observations. Fingerprints include the new shared dependencies;
this replay does not claim a fresh PKHeX execution. The release gate `npm run validate:atlas` passed all 272 repository checks and
reported zero mandatory two-region integrity failures. No personal save is committed.
Actual SoulSilver in-game testing and the user's Kingdra save validation remain
separate from automation.
