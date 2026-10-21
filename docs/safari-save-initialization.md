# Safari v1 — Milestone 3: save initialization and manual fallback

Version **0.25.77** adds `safari-zone/` as the Safari starting-configuration page.
Open it from Safari Atlas, or visit the existing site's `safari-zone/` path.
Load a save through **Reader's existing Load Save** control. No second loader,
file upload service or save writer is introduced.

## Using the starting configuration

The page initializes from the active Adventure Profile. Verified decoded values
are labeled **Verified save field**. Unknown values stay blank and say
**Unavailable · supply manually**. Old profiles remain usable; reload their save
in Reader to add newly supported Safari fields.

With no active adventure, the page labels a **default new Safari scenario**: the
first possible initial arrangement, zero area days, no objects, first challenge,
no customizer or object unlocks. This is a configurable scenario, not a claim to
be a trainer's actual initial layout. Default entry access describes a scenario
at the open Safari reception; rod/Surf access starts false and is editable.

1. Use **Starting values · manual corrections** to complete unknown fields or
   correct the baseline. These edits are labeled **Manually supplied starting
   value**, even when they replace a decoded value. Completing one category does
   not invent the others. Manual baseline corrections reset hypothetical edits.
2. Switch to **Hypothetical changes** to propose changes. Their labels and the
   before/after list distinguish them from the baseline. Area swaps move object
   counts; selecting a replacement initializes its objects empty. The proposed
   layout requires a confirmed Area Customizer value. Stored ages stay tied to
   area identity and never move or reset with layout positions.
3. **Reset hypothetical changes** restores the manually completed starting state.
   **Restore loaded/default start** also removes manual corrections, restoring
   the original decoded/default values and their original provenance.

Each field shows its original value. The original object records, decoded
snapshot and input file bytes are never mutated. Scenario edits last for this
visit; refreshing reconstructs the original starting point. Save/adventure
changes reinitialize it, including a new revision of the same Adventure Profile.
An unrelated notification without a profile revision change preserves edits.
Concurrent refresh responses are guarded so an older request cannot replace a
newer context. Storage denial supports a clearly labeled session-only default
scenario; it cannot replace existing profiles. Failure to refresh an already open
context reports that the last initialized values remain visible.

The existing Atlas manual layout remains a separate reference preference; it is
not imported as a saved game layout or silently applied to the simulator.
Atlas links into this page; return links lead to Safari Atlas and Safari Zone Gate.
The shared menu, Load Save route and theme storage are reused. No new hosting or
main-menu implementation is introduced.

## Supported fields and evidence

All offsets below are relative to the **already validated active general block**.
The existing Reader selects partition 0 or partition 1 (`+0x40000`); the new reader
runs only after its size, magic and general/storage checksum gates succeed.
It does not scan for plausible Safari bytes or choose a competing save slot.

| Field | Offset / structure | Behavior |
| --- | --- | --- |
| Local six-area arrangement | `0xC13C + position * 0x7A`, first byte | Six unique area IDs 0–11; invalid arrangements stay unavailable |
| Placed object count | Next byte in each `0x7A` record | 0–30; invalid count affects that position independently |
| Placed object types and raw coordinates | Record `+2`, count × four bytes `id,x,y,z` | IDs 0–23; aggregates categories using the verified M2 object table; invalid IDs affect that position, not the whole adventure |
| Stored twelve area counters | `0xC418`, twelve bytes | Counters indexed by area identity, 0–255; never extrapolated from today's date |
| Deferred-day accumulator | `0xC734`, one byte | Reported separately; never silently added to stored counters |
| Object unlock level | Low six bits at `0xC735` | Only 0–4 accepted; out-of-range values unavailable |
| Active Safari set | High two bits at `0xC735` | Local set 0 supported; linked/invalid selection requires manual layout/object/age fallback |
| Baoba logical stage | Little-endian u16 at `0xE92` | Only stages 0–7 accepted; Area Customizer status derives from the verified stage boundary |
| Full trainer ID | Existing decoded TID + SID × 65536 | Used by M2's object-group order; no new trainer offset |
| National Dex | Existing decoded Pokédex summary | Reused independently even when other Safari fields are unavailable |

Evidence is pinned and hashed in [the source ledger](safari-save-sources.json):

- The [primary Safari structure](https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/include/safari_zone.h)
  establishes record shapes, two area sets, identity-bound ages and packed unlock
  and selection fields. The primary accessors establish their runtime meaning.
- PKHeX's pinned HGSS implementation supplies a neighboring Pokégear caller-list
  offset of `0xC0EC`; primary Pokégear places this field at `+0x60C`, yielding
  base `0xBAE0`. Its primary size `0x658`, aligned and followed by the four-byte
  save-substructure trailer, puts the immediately following Safari block at
  `0xBAE0 + 0x658 + 4 = 0xC13C`. The primary save-array order confirms adjacency.
- The independently maintained
  [HGSS Safari editor](https://github.com/Yoyovicti/HGSS_SafariZoneEditor/blob/9b06bd854172599d81d89b8979aa00ac8ddee063/include/manager/save_data_manager.hpp)
  separately specifies `0xC13C`, stride `0x7A` and counters `0xC418`. It is marked
  experimental by its author, so it is corroboration, not the sole evidence.
- Six records of `2 + 30 × 4 = 122` bytes put counters at `+0x2DC`.
  Each set is `0x2E8` bytes. Two sets and the primary `0x28`-byte link leader put
  the deferred counter at `+0x5F8` and the packed fields at `+0x5F9`.
- PKHeX supplies HGSS's event-variable base `0xDE4`. Primary variable addressing
  uses two-byte entries indexed by `varId - 0x4000`; stage variable `0x4057`
  therefore sits at `0xDE4 + 2 × 0x57 = 0xE92`. Primary Baoba scripts and accessors
  establish the accepted stages and customization boundary.

The audit found an older PKSM script that labels `0xC148` as the day-counter
location. This conflicts with both derivations and lies inside the first area's
object storage. It is **not used**. The disagreement and source hash are recorded
rather than silently treating that script as validation of the implemented offset.

Reproduce the evidence ledger with the pinned research checkouts listed in
`scripts/audit-safari-save-evidence.py`, then run:

```sh
python scripts/audit-safari-save-evidence.py
npm test
```

## Unknown or intentionally unsupported state

Safari entry access, Surf/rod possession/access, current time of day and clock
penalty require manual input. Their absence does not become false, zero or
unlocked progress on a loaded adventure. A decoded stage does not invent received
object calls; the actual saved object unlock level remains separate.

Only **stored** area counters are known. The page does not forecast elapsed days,
apply pending-day accumulation or emulate DS clock penalties. A nonzero pending
value is explicitly reported. Coordinates are retained as raw object metadata;
there is no tile-collision/placement editor in this milestone.

Linked/transferred Safari sets have separate ownership, timing and expiry
semantics. Their selected arrangement, objects and ages are left unavailable;
local trainer progression can still be read independently. Manual completion
keeps the scenario usable. Unknown or malformed Safari fields do not make an
otherwise valid Reader adventure disappear.

The decoder has source-based verification and synthetic tests. **No real personal
save fixture or in-game validation was available**, and no such validation is
claimed. The Project Pokémon save-format page was inaccessible with HTTP 403;
it was not used to substantiate unsupported offsets.

## Snapshot compatibility and scope

`js/saves/soulsilver-safari.js` reads decoded facts through the existing parser.
`js/adventures.js` whitelists the optional Safari subrecord when creating and
restoring snapshots; it strips binary buffers, offsets and unknown properties.
Category counts are rebuilt from valid object records instead of trusting a
conflicting supplied aggregate. Existing schema/database versions stay at 1;
no migration rewrites stored adventures, legacy Planner data or manual layouts.
Old records lacking Safari data restore safely and show manual fallback.

`js/safari-scenario.js` preserves a frozen original plus independent starting and
current states, with per-field provenance. `js/safari-scenario-ui.js` connects this
to the existing adventure notifications and shared shell. The M2 engine adapter
retains unknown values; an unknown selected area is now reported as unknown,
rather than misclassified as an invalid configuration.

Milestone 4 adds live eligibility, complete target optimization and the integrated
simulator interface using this state. Milestone 5 remains the final audit/release.
These features are not claimed by the starting-configuration page.

## Validation and publication

`npm test`: **201 passed, 0 failed, 0 skipped** on Node 24 / Chromium 154.
Eleven initialization tests cover literal-offset fixtures for both partitions,
checksum rejection, invalid/partial fields, linked fallback, snapshot round trips,
no input-byte mutation, defaults/manual/hypothetical provenance, both resets,
pending-day separation and placement limits. Browser coverage loads a constructed
binary through the actual Reader parser, restores the new page, edits without
changing the stored adventure, reloads the original, handles save revisions and
profile clearing, tests older profiles/storage denial and exercises both themes
at 320/390/768/1440px beneath the Pages prefix.

A focused browser rerun checks the desktop card-flow correction; light-theme
phone and desktop screenshots were inspected. The source ledger reproduced
byte-for-byte, syntax/compilation checks and `git diff --check` passed. These are
synthetic/source-based checks, not real-save validation.

Release commit `a7cf7bc` was pushed to the existing `main` deployment branch on
2026-10-21 after a fresh fetch, using a normal fast-forward push. The subsequent
GitHub Pages API check still returned HTTP 403. Live publication is unconfirmed;
the successful push is not proof of deployment.
