# Atlas caught registrations — v0.25.55

## Scope and behavior

A small, locally hosted Poké Ball marks species registered **caught** in the active
SoulSilver Adventure Profile. Markers appear in Atlas encounter rows, the existing
Safari reference and Atlas EV Training results. They do not use Seen registrations
or current party/PC ownership. A species can remain marked after trading away or
evolving the Pokémon that originally registered it.

The compact context line identifies the active trainer. Clearing the active
adventure restores generic reference use without markers. Storage failure removes
unavailable markers and leaves geographical navigation, encounter tables and the
EV finder usable. No caught/uncaught filters or new collection-management views
are introduced.

Profile updates alter marker nodes in place. They preserve the current location,
open encounter disclosures, map-floor selection, focus and scroll position. New
locations and new EV result pages use the same current registration set. Profile
notifications, focus/pageshow and visibility changes refresh the snapshot context.

## Parser and snapshot compatibility

The parser now exports `allCaughtSpecies` and `allSeenSpecies` for species 1–493
alongside the existing scope-specific arrays and counts. Reader's regional/national
ordering, registration counts, Collection and ownership semantics remain unchanged.

This reads the same existing flag banks: Pokédex base `0x12B8`, four-byte header,
caught words followed by Seen words at `+0x40`. The pinned HGSS
[`include/pokedex.h`](https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/include/pokedex.h)
confirms the header and consecutive 16-word flag banks. Bits beyond species 493
include form-history padding and are not interpreted as additional species.

Full arrays are optional additions to snapshot schema/version 1. Older profiles
remain readable and keep their known caught registrations. An older regional
snapshot displays a reload hint because registrations outside that scope were not
stored. Reloading the original/latest save in Reader supplies the complete arrays;
no binary is persisted or reconstructed. Older complete National-Dex snapshots
already contain all species' registrations. No profiles or Planner records are
removed or migrated destructively. Invalid full arrays or disagreement with scoped
registrations fail validation before an atomic snapshot update.

## Shared game-specific data and coverage

`js/data/game-reference.js` provides an explicitly SoulSilver/Generation IV lookup
for the existing pinned species/move/nature identifiers and audited EV yields. It
reuses the datasets from the Planner and EV finder; it does not duplicate their
contents. Planner, formatted Atlas encounters and EV calculations now share this
boundary. Unknown/unsupported games return no data, and unsupported species names
remain unresolved rather than inheriting another game's records.

All **1,653 existing encounter records** (1,384 non-Safari and 269 Safari) resolve
to species IDs. Punctuation variants, gendered Nidoran, Unown punctuation forms and
the existing `Gyarados (shiny)` label resolve to the correct species registrations.
Species-level caught flags apply to the species, not individual forms or shininess.
All 493 species retain their audited Generation IV EV yields. This identifier
coverage check does not claim a new encounter-content audit or complete Kanto
coverage. Refer to the existing encounter and map audit ledgers for their scope.

Safari's existing table was extracted unchanged from `js/world.js` into
`js/data/games/soulsilver/safari-encounters.js`. A comparison against the preceding
release found identical serialized records, SHA-256:
`769f131cc6148882931d4e5ddf4ce614fca9494389f6cafe5d73d229d3228246`.
Its separate mechanics/data audit and mini Atlas remain pending.

The registry adds only identifiers/names and verified base EV yields. It does not
claim new coverage of learnsets, abilities, type mechanics or evolution rules;
those belong to the independent reference Pokédex milestone.

## Visual asset

`assets/icons/caught-gen4.svg` is an original 12×12 pixel-style UI icon inspired by
Generation IV Poké Balls, rendered with crisp edges. It is not an extracted game
sprite. It is local, has a meaningful accessible label, and adds no keyboard stop.

## Validation

`npm test`: **113 passed, 0 failed, 0 skipped**. Coverage includes:

- All 493 flag bits, regional versus National counts and reserved padding through
  constructed, checksum-valid binary data; original Reader counts remain intact.
- Species mapping across every existing encounter, form/name variants, audited
  yields and explicit rejection of unsupported-game fallback.
- Caught-versus-owned/Seen behavior, old snapshots, invalid replacement, profile
  switching and reference mode in an actual Chromium browser.
- In-place updates preserving location, floor, open disclosures, focus and scroll.
- Safari record preservation and caught markers in EV results.
- Local icon decoding beneath `/pokemon-reader/`, 320/390/768/1440px in both themes,
  and Atlas behavior when IndexedDB is unavailable.
- Existing Reader, Planner, persistence, map, location, encounter and EV regressions.

Test cleanup now unloads the prior app document before resetting IndexedDB. This
prevents pending reload/refresh work from reopening a database between cases;
Planner's runtime matching behavior is unchanged. Phone and desktop marker
screenshots were reviewed and `git diff --check` passed.

Synthetic and constructed-save checks do not establish real-save/in-game accuracy.
User reported “All working well” for the published milestone and authorized
advancing to the reference Pokédex. Broader independent in-game validation is
not inferred from that confirmation.

## Focused user checklist

1. Confirm **v0.25.55**, then load your latest save once in Reader so an older
   profile gains full registration flags. Open Atlas.
2. Open a location containing a species your Pokédex registers caught. Expect a
   small Poké Ball beside its name. A Seen-only species should have no marker.
   Caught species should remain marked even when absent from your party and PC.
3. Check another encounter section or location and Atlas EV Training. Rates,
   levels, conditions, time-of-day sections and geographical navigation should
   work as before, with the same marker meaning.
4. Refresh Atlas; markers should return. If using another adventure, select it in
   Reader or Planner and return to Atlas; markers should follow that profile.

This release tests Atlas caught indicators and their shared data boundary. The
standalone reference Pokédex and Safari mini Atlas remain subsequent milestones.
