# Pokémon Reader

## Safari v1 final audit — v0.25.79

The [Safari simulator](safari-zone/) now has its final integrated audit:
12 areas, 32 reachable method tables, all 153 target species and 2,822 replayed
plans. Source generators reproduced unchanged; independent examples and exhaustive
object-allocation checks verify the shared mechanics and optimizer.

All **222 automated checks pass**. The audit fixes missing-field recovery and keeps object-free encounters usable
when unrelated object identity/progress is unknown. See the
[release audit, coverage and remaining acceptance](docs/safari-v1-release.md)
and [feature guide](docs/safari-simulator.md). Live publication confirmation and
real-save/user acceptance remain pending.


## Safari simulator and optimizer — v0.25.78

The [Safari simulator](safari-zone/) now compares starting and proposed encounters
and finds target Pokémon setups using the verified shared engine. Plans show
area, method/time, objects, multipliers, credited waiting and locked prerequisites.
Preview and reset preserve the original save and manually corrected baseline.
Named progression controls and object guidance support save-free/manual use.

All **215 automated checks pass**. Desktop/mobile validation is recorded in the
[simulator guide](docs/safari-simulator.md). Real-save/user acceptance and live
Pages confirmation remain separate. Step 5 is the final integrated Safari audit.


## Safari save initialization — v0.25.77

The new [Safari starting configuration](safari-zone/) uses the existing Reader and
Adventure Profiles. Verified fields include local areas, object types/counts,
stored area days, object unlock level and Baoba stage. Missing fields stay
unavailable with manual configuration. Defaults, verified values, manual baseline
corrections and hypothetical changes have separate labels and two reset actions.
New save revisions reset the scenario without changing stored adventures or bytes.

Linked Safari state and real-time aging require manual fallback. Scenario edits
last for this visit. Live eligibility and target optimization follow in Step 4.
All **201 automated checks pass**. Decoding is source-verified and tested with
synthetic files; no real-save validation is claimed. Live Pages confirmation
remains subject to the network restriction.
See [field evidence, usage and limitations](docs/safari-save-initialization.md).


## Verified Safari data and mechanics — v0.25.76

Safari Atlas now derives its reference from audited HGSS slot tables: all twelve
areas, five methods where reachable, exact time/level differences and block-point
requirements. A shared pure engine handles ten-slot replacement, category aging,
30-object limits, staged unlock groups and hypothetical layout changes. The old
269-row reference is replaced by 339 verified catalogue rows.

Atlas remains unfiltered; save initialization and the interactive simulator are
Milestones 3 and 4. Rates are encounter-slot shares before lead abilities/Repel.
All **186 automated checks pass**, including independent fixtures and browser
regressions. Live Pages confirmation remains blocked by network policy.
See [mechanics, independent fixtures, source disagreements and limits](docs/safari-mechanics.md).


## Safari foundation audit — v0.25.75

Milestone 1 rechecks all twelve area identities and six-position navigation against
pinned primary HGSS sources, preserving the existing maps, Gate links and manual
editor. Incomplete stored layouts now fail safely before rendering. Encounter
mechanics and save decoding remain explicitly pending the later Safari milestones.
All **172 automated checks pass**. Publication verification remains pending because
the environment blocks the Pages API and production URL.
See [audit evidence and limitations](docs/safari-foundation-audit.md).


## Pokédex icons and consistent Reader headings — v0.25.74

Seen uses open/closed eye icons; Caught uses the existing Poké Ball icon, muted
when unregistered. Accessible labels and hover text retain the exact state; Owned
remains text. Party now uses the same heading/intro spacing as every Reader view.
Noninteractive route-focused headings no longer show a selection-style outline.
All 171 automated checks pass, including icon states, identical heading positions,
outline removal and six-card phone layout. Online user acceptance remains pending.


## Load Save refinements — v0.25.73

Reader help uses info disclosures; Adventure Profiles hide while a save is loaded.
Reader views share the Party mobile width, with pointer focus rings removed from
view headings. PC searches include saved move names from local HGSS data.
The main-menu Pokédex now includes save Seen/Caught/Owned filters and counts;
the duplicate Reader view is removed and old links redirect to the reference.
All 171 automated checks pass, including Reader, Planner, Atlas and unified
Pokédex regressions plus case-insensitive Flash search and equal mobile widths.
Online acceptance with the user’s current save remains pending.


A personal, browser-based tool for reading Pokémon game save files and exposing information that is normally hidden from the player.

## Johto Atlas completion — v0.25.72

The current Johto Atlas milestone is implemented and technically audited:
69 locations, encounters and reference details, 299 map views, dungeon connections
and EV Training. A final mobile fix keeps the full-size viewer’s floor controls
in place when following a marker. Safari mechanics/calculator and Kanto expansion
remain separate. See [verified coverage and remaining scope](docs/atlas-johto-completion.md).
User outcome validation continues on the existing GitHub Pages site.

## Team Planner navigation — v0.25.66

Main team and Postgame options are the remaining Planner tabs. HM plan and EV
training remain in each Pokémon's popup; their duplicate navigation buttons are
removed. Old HM/EV section links fall back to Main team. Saved plans and progress
remain unchanged. All **150 automated checks pass**. Live confirmation and online
acceptance remain pending.

## Team Planner current details — v0.25.65

Boxed Pokémon levels are calculated locally from saved experience and verified
HGSS species growth rates; party levels remain authoritative. Current natures
outside the preferred list appear as an extra checked option with an italic note,
and their stat modifiers join the info overlay. Preferred goals remain unchanged.

Main team no longer repeats HM sentences from its notes; useful evolution/move
notes remain, and HM explanations stay in HM plan. Every new/reopened popup
starts at the top while background updates retain the current scroll position.
A queued close event no longer clears a newly opened member.
All **150 automated checks pass**. The phone nature overlay was reviewed.
Live confirmation and user-save acceptance remain pending; see [Planner UX notes](docs/planner-ux.md).

## Team Planner popups — v0.25.64

Cards retain the species label under the sprite, alongside Gen IV type badges,
then show saved name/nickname or **Planned**, followed by
level or **No linked Pokémon**. Selecting a card opens a Party-style popup with
Close/Escape and focus restoration. Save updates and checklist edits retain the
open member; Choose saved Pokémon is collapsed initially.

Ability is a single checkbox, and priority-nature descriptions sit in an info
overlay available by hover, focus or tap. HM sections retain move name, duration,
useful explanations and learned checkboxes. Repeated owner/status text and the
separate Temporary HMs line are removed from member details. EV sections show
total EVs under the name, with individual progress on the existing checkboxes.
All **148 automated checks pass**, plus final focused popup/layout checks.
Phone and desktop screenshots were reviewed in both themes. User-save acceptance
and live confirmation remain pending.

## Team Planner UX — v0.25.63

The top menu now opens a shared **Settings** gear for the theme. In Team Planner,
it also holds planner/adventure selection, creation, rename, backup and reset.
Party, Move goals and EV targets lead the page beneath a single title and an info
hint. Compact Pokémon cards open Main team, HM plan and EV training together.

Linked cards show the actual saved evolution stage; unlinked targets use a grey
sprite. Ability and nature have completion checkboxes; manual nature choices are
exclusive and follow the priority list. No eligible family member disables the
saved-Pokémon selector and enables manual progress without discarding an existing
association. Unique party-family auto-linking and explicit PC/ambiguous matching
are preserved. All **147 automated checks pass**, including existing Reader,
Atlas, Pokédex and Safari regressions and 320/390/768/1440px theme checks. Phone
and desktop screenshots were reviewed. Live confirmation and user-save acceptance
remain pending. See [Planner UX checks](docs/planner-ux.md).

## Integration review — v0.25.62

Reader keeps the selected Party, PC, Pokédex or Collection section when restoring
an Adventure Profile, refreshing, or returning from another tool. Planner sections
follow their URLs and support Left/Right/Home/End keyboard navigation, with
accessible tab selection and a named reset confirmation.

The integrated browser journey checks all four tools with two preserved adventure
profiles, both themes and phone/tablet/desktop layouts under the Pages URL prefix.
All **146 automated checks pass**. Pushed for the existing Pages deployment;
live confirmation and focused acceptance remain pending.
See [review evidence and the two focused online checks](docs/integration-review.md).

## Safari navigation refinements — v0.25.61

The Safari page now begins with **Safari Zone**, followed by the map/compass and
then the six area buttons. The example/adventure context lives inside the manual
layout editor. Moving between areas preserves the viewport; loading or failing
maps reserve the same space so arrows stay in place.

The in-game Area Customizer becomes available with Baoba’s second challenge.
Manual layouts mirror that arrangement because the app does not decode it yet;
starting arrangements also vary. See [Safari notes](docs/safari-mini-atlas.md).
All **143 automated checks pass**, including repeated arrow travel on phone and
desktop. Pushed for Pages deployment; live confirmation remains pending.

## Safari area maps — v0.25.60

All twelve Safari areas now show their original HGSS reference map between the
compass controls. Maps follow area identity when you change the manual layout;
select a map to open the original full-size image. Source credits are linked
beneath each preview. Existing six-position navigation was accepted by the user.

These images load online from Bulbagarden Archives. A failed image leaves a
source link and usable navigation. They show reference terrain, without a save
position or placed-block overlay. The existing locally bundled Atlas maps remain
unchanged. Workspace networking prevented downloading these additional originals;
the user subsequently reported that the maps look great. See [Safari notes](docs/safari-mini-atlas.md).
All **142 automated checks pass**; rendering fixtures cover both themes and
320/390/768/1440px widths. The user accepted this map release.

## Safari mini Atlas — v0.25.59

Go north from **Safari Zone Gate**, or use Atlas’s Johto **Safari** link, to browse
six areas in a verified three-column, two-row layout. Compass controls move between
neighbors; the entrance south of the bottom-center area returns to the Gate.

**Set manual area layout** mirrors your game’s six areas. Saved layouts stay
separate for each adventure and reference mode. The initial arrangement is labeled
as an example: Safari layout/progression is not decoded from saves. Nothing here
changes the in-game arrangement. Storage failures keep session-only editing usable
and preserve committed layouts, Reader profiles and Planner data.

Area encounters reuse the main Atlas display, caught markers and reference
Pokédex links. All 269 existing Safari records remain unchanged and explicitly
pending their own mechanics/data audit; no block/aging calculator or progression
filter is added. The original all-twelve-area reference remains available.

See [source verification, storage behavior and the focused online checklist](docs/safari-mini-atlas.md).
All **140 automated checks pass**, including existing-tool regressions, layout
persistence/isolation, cross-tab updates, storage failures and mobile themes.
The user accepted the Safari navigation and requested maps for each area.
The user accepted v0.25.58 Pokédex navigation before this milestone began.

## Reference Pokédex — v0.25.58

Use **Pokédex** in the shared menu for the standalone SoulSilver species reference,
with or without a save. Johto/National numbered lists show local HGSS sprites and
types. Menu/search stay in one stationary block; only the separate species list
scrolls. Search jumps without hiding neighbors; closing a species card
restores list position/focus. Reader's save-based registration Pokédex is preserved.

Details include Gen IV abilities, EV yields, type matchups, wild held-item odds,
evolution requirements, current Atlas locations, complete HGSS move lists,
evolution-wide TM/HM compatibility and stat ranges. Atlas encounter names open the
matching species; location links open exact Atlas destinations. The shared theme
and presentation are reused across tools.

All 493 species' level-up/Egg/tutor/machine sets match the independent HGSS
cross-check: 1,972 comparisons, zero differences. Primary data includes twelve
alternate form records; no hidden abilities, Fairy types or modern stats/learnsets
are substituted. Location coverage retains the Atlas's Johto/League/Mt. Silver
scope; full Kanto and the Safari mechanics audit remain separate work.

v0.25.57 removes the introductory header, keeps search highlights within the list,
displays each evolution path on one line with requirements above its arrows, and
colors reduced/immune matchups green, weaknesses yellow and ×4 weaknesses red.
Species locations retain relevant encounter/access conditions without unrelated
legendary narratives: Horsea no longer inherits Lugia’s Whirl Islands notes.
Atlas’s own location notes and the TM/HM table remain intact.

v0.25.58 fixes Atlas-to-Pokédex returns: a directly linked species card positions
and highlights its species in the list before opening. Close/Escape returns to
that row. Normal in-list cards still restore their original browse position.

See [sources, limitations and the focused online checklist](docs/reference-pokedex.md).
All **129 automated checks pass**, including Reader/Planner/Atlas regressions,
keyboard/history behavior and mobile layouts. The user accepted the visual refinements and reported v0.25.58 navigation is
perfect; the reference Pokédex milestone is user-validated. Safari mini Atlas is the
next milestone after this one is validated.

## Atlas caught registrations — v0.25.55

Atlas encounter species and EV Training results now show a small Poké Ball when
registered caught in the active Adventure Profile. Markers use Pokédex flags;
Seen status and party/PC ownership do not determine them. Navigation, encounter
conditions and the generic no-save Atlas remain supported.

Reload your latest save once in Reader to add full 493-species registration flags
to an older profile. Existing Reader counts and Planner data stay intact. Older
regional snapshots retain known caught markers and display a reload hint.
Profile changes update markers without resetting open encounters or map floors.

Shared SoulSilver identifiers and audited EV yields now serve Planner and Atlas;
all 1,653 existing encounter names resolve to species IDs. Safari's existing
records are preserved unchanged. All **113 automated checks passed** for v0.25.55, including
Reader/Planner regressions, mobile themes and Pages paths. The user reported “All working well”
and authorized advancing. See the [focused Atlas checklist and compatibility notes](docs/atlas-caught.md).

The independent reference Pokédex is implemented in v0.25.56; Safari mini Atlas
remains later work.

## Planner integration — v0.25.54

Planner now uses Reader's persisted Adventure Profile across Main team, HM plan
and EV training. Associate your existing Mando plan once using **Use this plan for
[trainer]**. Unique party matches include earlier evolutions; PC-only or ambiguous
matches require a choice. Links persist through evolution, party/PC transfers and
refresh. Current moves/HMs, nature, evolution and EV progress never rewrite goals.
Missing Pokémon retain labelled last-known values, without counting them as current
completion. The extra EV save-upload control has been removed.

Multiple named planners and adventures are stored independently. The latest v1
Planner data is activated once, while its original key/raw migration copy remains
intact. v1/v2 JSON import creates a separate reference plan. Reference tools and
manual planning still work without a save.

See the [precise release checklist, migration details and source verification](docs/planner-integration.md).
All 104 automated checks pass, including Reader/Atlas regressions and mobile,
cross-tab, migration and storage-failure coverage.
Atlas caught indicators, the reference Pokédex and Safari mini Atlas are later
milestones. No real-save or in-game validation is claimed by automated checks.

## Adventure integration — v0.25.53 (foundation)

The following records the first milestone. Planner storage and integration now
follow the v0.25.54 behavior above.

The first integration milestone adds optional **Adventure Profiles**. Successfully
decoded SoulSilver saves store trainer, Party, all PC slots and Pokédex progress in
IndexedDB on this browser. Refreshing Reader restores the active profile without
reloading the original file. Use **Load Save** to choose a replacement or **Open
adventure** to restore a saved profile. Saves never leave the browser and original
binary files are never persisted. Browser/site-data clearing removes these local
profiles; retain your original save files.

Profiles use separate unique IDs with a game/TID/SID matching index. Check **Keep
this save as a separate adventure** when loading another playthrough with the
same identity. When multiple profiles share an identity, loading asks which one
to update. Invalid, incomplete or corrupt decoded records cannot replace stored
progress; storage failures leave prior records intact and show a warning while
Reader remains usable for the current session.

The existing Planner storage key and JSON backups remain unchanged. A lossless,
unassociated migration copy is stored separately when Reader opens. The current
Planner still owns its v1 browser data; multiple-plan management and association
are the next milestone. No plan is silently assigned to a trainer.

Evolution exports require the original binary in the current session. Restored
profiles explain when it must be reloaded. Exporting a modified save downloads it
without replacing loaded progress; explicitly load the exported file if you want
it to become the adventure snapshot. This behavior change was approved by the user.

Safari layout/progression is not decoded. PC HP/status remain unavailable, as
before. The independent reference Pokédex, full caught-flag Atlas integration,
Planner identity tracking and Safari mini Atlas are subsequent milestones; this
release does not claim they are implemented. See
[architecture, risks, milestones and manual validation](docs/application-integration.md).

Automated checks cover synthetic parsed records and constructed binary records;
they do not establish real-save or user acceptance. This milestone requires online
validation with a real SoulSilver save before the next phase begins, following
the repository's phase-completion rule.

## Current target

The first supported game is **Pokémon SoulSilver**.

The application is intended to process save files locally in the browser whenever practical, without requiring them to be uploaded to a server.

## Planned features

- SoulSilver save-file detection and validation
- Save and trainer information
- Party Pokémon information
- PC box Pokémon information
- Detailed Pokémon data and hidden values
- A custom PokéEarth-style game world reference
- Support for additional Pokémon games after SoulSilver is complete

## Current Atlas priorities

The encounters, maps/floor navigation and structured location-detail milestones
have been published and accepted. The next Atlas feature is an EV training finder
with Surf-first recommendations. Safari Zone has its own development track and
does not block remaining Atlas features or visual improvements. Its eventual tool
will integrate through Safari Zone Gate and a direct link. Kanto expansion and the
final integrated audit remain future work. New datasets stay explicitly scoped by
game, starting with SoulSilver. See ROADMAP.md for completion status.

## Development approach

The project starts with plain HTML, CSS, and JavaScript. Features will be implemented incrementally and verified against real save data before expanding the scope.

See [ROADMAP.md](ROADMAP.md) for the development plan.

## Run and test locally

Use Node.js 22 or later:

```sh
npm ci
npm run dev
```

Open the address printed by the server, then visit `pokedex-earth/` for the Atlas.
No build step is needed. Save files are selected in the browser; do not commit personal saves.

Run `npm test` for the Reader, Atlas, and Planner browser regression checks. Tests require Chromium on
your PATH, or `CHROMIUM_PATH` set to its executable. They launch their own temporary
server and browser, test every existing connection button plus search/filter
behavior, Reader invalid-save handling, and Planner persistence/tabs, and clean up afterward. Encounter checks validate local coverage, distributions and known reference cases; they do not perform a live content audit or real-save parsing validation.

## Development and online validation

Implement focused milestones on feature branches in the cloud environment. Test
the changed feature and relevant Reader, Planner, and Atlas regressions before
committing, integrating, and pushing to the existing GitHub repository. The user
has authorized publishing completed, validated milestones without another approval
checkpoint. Keep unfinished work off the deployment branch.

Use the existing GitHub Pages site for user testing. Report the version, changes,
automated checks, deployment status, and what to try online. User acceptance is
pending until they test when available; a successful push alone does not prove the
new version is live. No separate preview host or repository is required.

## Current Atlas checkpoint

**v0.25.37:** all 70 grouped Johto/border locations have been checked against
Serebii and Bulbapedia for static names, landmarks, access/story conditions and
connections. Corrections include the Route 35–36 Cut shortcut and missing HGSS
story gates. Goldenrod Tunnel retains “Goldenrod Underground” as a search alias.
Every card links the reference sites under Sources.

See the [full audit and online test checklist](docs/atlas-static-audit.md) and
[machine-readable coverage ledger](docs/atlas-static-audit.json). The independent
static audit is complete for this scope; user validation of the published result
is pending. Encounter tables and Safari block mechanics are unchanged and still
need their own completion/audit before simulator work.

## Versioning

During development, the application uses the format **0.<phase>.<iteration>**:

- The first number stays at `0` until the project reaches its first stable release.
- The second number identifies the current development phase from [ROADMAP.md](ROADMAP.md).
- The third number identifies a meaningful application iteration within that phase.

The iteration number is intended to make deployed builds easy to identify while testing. Documentation-only changes do not require an application version change.

## Reader dashboard redesign

Reader **v0.25.35** completes the implementation of milestones B–F on the dashboard
foundation. Atlas remains v0.25.27; Team Planner and the binary parser are unchanged.
The user requested one integrated release followed by final user testing.

- Overview: raw-save upload guidance, trainer cards, badge artwork, parsed summaries,
  and interactive summary buttons. Load Save in the top ribbon clears the session
  and returns to the initial upload screen. The upload area is hidden once loaded;
  the old diagnostic Save Information block has been removed.
- Party: six compact card buttons in a three-column, two-row grid. Sprites remain
  96px; cards show nickname, Generation IV types, and an HP bar. Status, held item,
  level, gender, and full identity remain in details. Enter or Space opens a card.
- Details: one modal for Party and PC with Summary, Stats, all four Moves, Training,
  and History. Escape closes it; Tab stays inside; closing restores focus. Existing
  evolution export controls remain available here. PC records do not store current
  HP/battle stats/status; the UI identifies unavailable fields rather than inventing them.
- PC Storage: all 18 boxes and 30 original slots, previous/next buttons, box selector,
  occupancy, and search by nickname/species/number. Search highlights in place and
  provides results that navigate to each original box and slot.
- Pokédex: readable species cards, search and registration/ownership filters, and
  pagination. Regional/national scope comes from the existing parser. Seen, Caught,
  and Currently Owned remain independent; ownership excludes Eggs, Day Care, and
  traded-away Pokémon.
- Collection: all existing summaries, duplicate/caught/missing lists, search, sorting,
  and pagination, with expandable occupancy, gender, and form details. New owned-species and shiny
  individual lists provide destinations for the corresponding summary buttons.

Desktop and mobile use two horizontal ribbons: Load Save/Planner/Atlas/theme at the
top, then Reader views above the companion heading. The Reader ribbon sticks to the
top while scrolling. Mobile retains a compact box selector.
Dark mode is the default, with a locally saved light/dark preference and reduced-motion
support. Uploaded saves are held in memory only. Rapid save replacement clears dialogs
and prevents old asynchronous results from overwriting the current save.

Species metadata and sprites still come from PokéAPI and its public sprite repository.
Only species/item/move identifiers are requested; save contents are never uploaded.
Type badges use PokéAPI historical typing for Generation IV, including species whose
modern type changed to Fairy (see [historical type records](https://github.com/PokeAPI/pokeapi/blob/master/data/v2/csv/pokemon_types_past.csv)).
Metadata requests time out after eight seconds and fall back to explicit unavailable
labels. Binary decoding, ability/item/nature identification, PP/PP Ups, Hidden Power,
regional registration logic, and evolution mechanics remain unchanged.

`npm test` runs 26 browser tests covering Atlas and Planner regressions, Reader
invalid-save handling, routing/themes, synthetic parsed-save rendering/replacement,
six-slot Party order, modal keyboard behavior, PC order/search, registration versus
ownership, collection controls/pagination, metadata outages, theme contrast, loaded layouts at 320/390/768/1440px, reset/reload behavior, sticky ribbons, and
summary destinations. Synthetic fixtures are injected by the test
harness only; they do not validate the real binary parser or game-data accuracy.

For optional screenshot review, create a local output directory and set
`READER_SCREENSHOT_DIR` when running tests. Cloud environments with a proxy CA can
set `CHROMIUM_CA_CERT` to their trusted CA certificate; the test harness imports it
into an isolated temporary Chromium trust database using `certutil`, retaining TLS
verification. Neither variable is required for the normal regression suite.

Final user acceptance and real-save validation remain pending. On the existing
GitHub Pages site, confirm v0.25.35, load a known SoulSilver save, compare trainer,
Party, PC, registrations, and collection counts against the game, then replace the
save and verify every view refreshes. Check both themes, mobile navigation, dialog
scrolling/keyboard controls, PC search, and existing evolution export behavior.
Evolution writing still requires the real-game validation listed in the roadmap.

Overview summary buttons open Party, PC Storage, the unique-species owned list,
individual shiny Pokémon (including Eggs when counted), and Seen/Caught Pokédex
filters. Owned-species browsing includes species outside the currently active
regional Pokédex, matching the existing unique-species statistic. Shiny entries
show their nickname, original Party/box slot, and an Inspect button.

Reader v0.25.31 makes the top ribbon controls subtle text links, retaining keyboard
focus indicators, touch targets, and existing reset/theme behavior.

Reader v0.25.32 compacts Party and refines the shared detail dialog:

- All six occupied cards fit in the tested 320×700, 390×844, 768×700, and 1440×900
  viewports. Smaller viewport heights or larger accessibility text may still scroll.
- HP bands: green above 50%, yellow above 35%, orange above 20%, red above 10%,
  and deep red at 10% or below. Actual HP numbers remain in details.
- The nickname appears once in the dialog title; shiny and Egg icons sit at the
  header's far right. Nature changes occupy separate green-up and red-down rows;
  neutral natures explicitly have no stat changes.
- Borderless Moves (slot/name/current-max PP/PP Ups) and Training (stat/IV/EV)
  tables retain all four moves and six stats. Totals precede Hidden Power and stay
  unavailable if any contributing value is missing.
- History omits unknown egg fields and unnamed forms, and shows Friendship / 255.
  Generation IV location names now cover the base, 2000, and 3000 ID banks using
  [PKHeX's location reference](https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/Resources/text/locations/gen4)
  and its verified bank offsets. Unrecognized met IDs retain an explicit numeric
  fallback rather than a guessed name. Binary parsing and calculations are unchanged.

The 24 browser checks include six occupied cards, unchanged sprite dimensions,
whole-card keyboard activation, HP colors, nature-row layout, table columns/totals,
icon placement, conditional history, and location-name examples. Real-save review
of the revised Party and details remains pending on the published site.

Reader v0.25.33 removes the redundant Current Party subtitle, right-aligns the
nature modifier block while keeping its arrows left-aligned, and gives Moves
(Name/PP/PP Ups) and Training (Stat/IV/EV) tables 70%/15%/15% columns.

Reader v0.25.34 puts nature percentages before their stat names (for example,
↑ +10% Attack) and right-aligns PP, PP Ups, IV, and EV headers and values.

Reader v0.25.35 aligns the top ribbon text vertically. Only Overview is available
until a valid save finishes loading; the other Reader links are dimmed and excluded
from keyboard navigation. Direct view/section links fall back to Overview. Loading
a new save or resetting relocks them. Team Planner and Atlas remain independent.
The 26 browser checks include unloaded/invalid/reset route protection and ribbon
text alignment at 320/390/768/1440px.

## Atlas navigation — v0.25.38

Atlas opens New Bark Town on every fresh visit. Existing overland connections
surround the current location in north/east/south/west positions, above static
information and encounters. Interior and unassigned connections remain in an
Other connections group. These are reference links: access notes still describe
story gates, Surf requirements, and one-way ledges. Clicking a destination moves
focus and scrolls to its heading. Manual search and location-type filtering remain
available; clearing them opens the complete 70-location directory.

Reader remains v0.25.37 and Team Planner is unchanged from the fetched deployment
baseline. No encounter filters, map artwork, or encounter data changes are included.
`npm test` now includes default-entry, compass geometry, destination focus, and
navigation-before-content checks at 320/390/768/1440px. Publication and user
acceptance are tracked in [the navigation milestone](docs/atlas-navigation.md).

## Atlas overview and encounters — v0.25.39

Every location now has an overview block (name, compass navigation, landmarks,
access notes, and sources) followed by a separate encounter block. Static notes
use two columns on wider screens and stack on mobile. Locations without encounter
tables explicitly say their data has not been added; this does not claim there are
no wild Pokémon there. All existing encounter records, search/filter behavior,
and the New Bark starting location remain intact. No map artwork or encounter
filters are included. Reader stays v0.25.37 and Team Planner is unchanged.

All 35 automated checks pass, including separate accessible blocks for all 70
locations at 320/390/768/1440px, unchanged encounter counts, every connection,
and Reader/Planner regressions. User review of the published layout is pending.

## Atlas opening-area maps — v0.25.40

Maps now sit between compass controls for New Bark Town, Route 29, Cherrygrove
City, Routes 30–31, and Violet City. Previews preserve north-up orientation and
aspect ratio within a bounded height; select a map to open the full-size local PNG
in a new tab. Other locations keep the text compass. A failed image leaves a
readable fallback and functioning navigation. Source links appear under Sources;
[asset provenance and credits](assets/maps/README.md) record the pinned archive.

This milestone covers six outdoor maps only. Additional locations and interior
floors need their own verified assets; the Atlas does not yet have full map
coverage. Reader v0.25.37, Team Planner, static data, and encounter tables are
unchanged. No encounter filters were added. The 37-check suite covers asset
integrity, image loading, all six journey steps and compass layout at
320/390/768/1440px, failed-image recovery, and existing Atlas/Reader/Planner behavior.
User acceptance of this map milestone remains pending.


## Atlas route reference — v0.25.41

All 23 existing numbered routes (26–48) now have SoulSilver encounters checked
against Serebii, Bulbapedia and pinned game data. The six missing route tables
(26–31) are added; older route tables are corrected. Routes also have expandable
Items & Apricorns and NPCs & trainers sections, including hidden items, daily
trees, weekday gifts, phone contacts and access conditions. Search includes these
features. The six opening maps and compass layout are preserved.

The route reference contains 519 encounter records and 158 item/Apricorn records.
Rates and discrete level sets follow the actual SoulSilver slot rules; Headbutt
groups, radio prerequisites, outbreaks, Kenya and Sudowoodo are distinguished.
See the [route audit](docs/atlas-route-audit.md) for coverage, disagreements and
evidence. Data is explicitly scoped to SoulSilver so future games cannot silently
inherit its records. Other locations and Safari mechanics remain outside this
audit; Reader remains v0.25.37 and Team Planner is unchanged.

Validation: 43 automated checks pass, covering route content/distributions, game
isolation, mobile/desktop presentation and Reader/Planner regressions. User
acceptance and real-game validation of the published result remain pending.


## Whole-Atlas encounters — v0.25.42

All **69 existing non-Safari location groups** now have audited wild/stationary
encounter coverage: 53 with records and 16 explicitly verified as having no fixed
wild encounters. This includes Cherrygrove and other city water, cave floors,
Headbutt/Rock Smash, radio, outbreaks, the Bug-Catching Contest, Unown unlocks,
weekly Lapras, SoulSilver legendary levels and eligible roaming Pokémon notes.
There are 1,384 non-Safari records; the prior route data is unchanged. Safari Zone
Gate is included, while Safari Zone's 269-record dataset is untouched.

See the [full encounter audit](docs/atlas-encounter-audit.md) for the 69-location
inventory, source evidence, game-specific discrepancies and reproduction steps.
The revised order is recorded in AGENTS.md and ROADMAP.md. Maps are the next
milestone; structured gifts/trades/items/Trainer details follow them. This is not
full Kanto coverage or a completed Safari Zone project.

Validation: **53 checks passed**, with no failures or skips, including Reader/Planner
regressions and phone/desktop Atlas checks. Cherrygrove and National Park mobile
screenshots were reviewed. Reader remains v0.25.37; Team Planner is unchanged.
User acceptance and independent in-game validation of Atlas v0.25.42 remain pending.


## Atlas maps and floor navigation — v0.25.43

All 69 existing non-Safari locations now have map references: 150 labelled
area/floor views from 148 locally hosted PNGs. Multi-floor locations offer a
selector and Previous/Next controls; the image, full-size link and source change
together. Encounter information and compass connections remain available.
The opening six maps retain their original bytes. Safari Zone itself is excluded.

Battle Frontier grounds explicitly use the shared Platinum/HGSS layout; Whirl
Islands' additional chamber screenshot is labelled as a reference view. Day Care
and Magnet Train Station show explicitly labelled surroundings. See
[coverage and validation](docs/atlas-map-expansion.md) and
[asset provenance](assets/maps/README.md). User outcome acceptance remains pending.

## Atlas location details — v0.25.44

All 69 existing non-Safari locations now have structured, searchable reference
sections for items/Apricorns, TMs/HMs, gifts/trades, shop exchanges and NPCs/trainers.
The pass includes 686 item/reward entries, 22 gift/trade/prize Pokémon entries,
371 shop offers, 156 service interactions and 370 trainer/team variants.
Weekday, story, version, National-Dex and historical-event conditions are retained.
The existing maps and encounter tables remain intact.

See [scope, evidence and validation](docs/atlas-location-details.md). All 64 checks
pass, including mobile UI and Reader/Planner regressions; user outcome acceptance
remains pending. Safari Zone itself remains the next separate milestone.

## Atlas EV training finder — v0.25.45

Use **EV Training** in Atlas to choose a stat, in-game time and encounter method.
Surfing appears first; the default shows only tables with 100% clean EV encounters.
Results include Pokémon, encounter percentages, levels, base EV yields, unwanted
encounters and access notes. Open in Atlas goes directly to the location; returning
keeps your finder controls. Direct link:
https://thedraconicpanda.github.io/pokemon-reader/pokedex-earth/#ev-training

The finder uses the existing audited encounters and pinned Generation IV yields.
Percentages describe encountered Pokémon, not the chance of an encounter per step.
Safari is excluded. Held-item/Pokérus bonuses and progression filters are future
work. All 72 checks pass; user outcome acceptance remains pending. See
[calculation rules and validation](docs/atlas-ev-training.md).

## Atlas encounter sections — v0.25.46

Pokémon lists now use collapsed sections throughout Atlas: Morning, Day and Night
walking encounters, plus Surfing, Fishing and Headbutt. Rock Smash, contests and
special encounters retain separate sections where present. Floors, tree groups,
rod types and conditional entries remain labelled inside their section. An all-day
walking record appears in all three applicable time views; encounter data and rates
are unchanged. Placement remains below the location overview pending the next
visual-design step. Safari receives the presentation change only, not a data audit.

All 73 automated checks pass, including encounter coverage, time grouping, EV
Training and Reader/Planner regressions. User outcome acceptance is pending.

## Atlas region and tool landings — v0.25.47

Atlas now opens with region cards in debut-generation order: Kanto, Johto, Hoenn,
Sinnoh, Unova, Kalos and Alola. Johto is available for SoulSilver; other regions
are clearly marked as planned and cannot open SoulSilver content accidentally.
The Johto landing has Navigation, EV Training and a disabled future Safari card.
Its summary and expandable guide information replace the long tool introduction
that previously appeared above every Navigation view.

Navigation and EV Training retain their direct links (`#atlas`, `#ev-training`),
and `#location=...` links still open the exact location. Region and Johto home
links support browser Back/Forward. Walking section titles now include the game
clock ranges, and redundant walking-row time text is removed. Legendary encounters
and roaming requirements have a dedicated disclosure; other contextual notes
remain available in their own disclosure. Repeated tool-wide encounter/Repel prose
is removed from location views. Encounter, map, reference and EV datasets remain
unchanged. All 74 automated checks pass, including phone/desktop presentation and
Reader/Planner regressions. User outcome acceptance remains pending.

## Shared theme and navigation — Atlas v0.25.48

Reader, Team Planner and Atlas now render the same `<app-menu>` component from
`js/app-shell.js`, styled by `css/app-shell.css`. The menu order is Load Save,
Team Planner, Atlas, then the theme switch. From another tool, Load Save opens
Reader's Overview; within Reader it retains the existing reset/upload behaviour.

All three tools use the existing `pokemon-reader-theme` preference. The saved
choice is applied before page content renders, retained across navigation, and
synchronised between open tabs in the same browser. Dark is the default when no
preference is saved. Theme preferences are browser-specific. Atlas and Planner
surfaces, inputs, cards and text support both palettes. Region cards remain in
two columns on phones and desktop, pairing Generations I/II, III/IV and V/VI.
Johto tools may still stack on smaller screens. Game data is unchanged.

All 75 automated checks pass, including shared-menu navigation, theme persistence,
320/390/1440px region layout and Reader/Planner regressions. Phone and desktop
screenshots were reviewed in both themes. User outcome acceptance is pending.

## Compact Atlas navigation — v0.25.49

Region cards show the region, generation and availability without game names.
Johto's feature cards are ordered Navigation, Safari (planned), then EV Training.
The Johto toolbar shortcut also uses the shorter region name; the Johto heading
still identifies SoulSilver.

Navigation opens with search collapsed, leaving route connections as the main
travel controls. Expand Search locations to use the search field and type filter
and see the location count. Collapsing search keeps its values and results;
following a connection still opens its exact destination. Game data is unchanged.
All 76 automated checks pass, including collapsed search, route travel, feature
order and layouts at 320/390/1440px. User outcome acceptance is pending.

## Atlas location presentation cleanup — v0.25.50

All 70 Atlas locations use the compact layout: the location heading replaces the
repeated region/summary line, Landmarks & features remains, and the separate
Access & progression block is omitted. Map links no longer repeat the location
name beneath them. Floor/area selectors, image alternative text, full-size map
link labels, connections, reference details and encounter conditions remain.
Underlying summaries and access notes are unchanged and remain searchable.
Automated checks cover the full location inventory, floor selection, search,
route travel and Reader/Planner regressions. User outcome acceptance is pending.

## Atlas compass navigation — v0.25.51

Location travel uses a reserved four-direction compass around the map. North and
south slots keep their height even without exits; west/east slots stay beside
the map. Subtle theme-aware arrows sit behind destination buttons, replacing the
visible cardinal headings. Arrows on empty slots are decoration, not controls.
Destination buttons retain directional accessible names and keyboard focus styles.
Floor/area controls sit above the compass so they do not displace the side buttons
relative to the map. Other connections remain a separate labelled group.
No connections, travel requirements or game data change. HM indicators remain a
future step requiring verified per-connection requirements. User acceptance of
the compass appearance is pending on the existing Pages site.

All 77 automated checks pass, including compass slot geometry, accessible names,
320/390/1440px layouts, route travel, floor changes and Reader/Planner regressions.
Phone and desktop screenshots were reviewed before publication.


## Team Planner save EV refresh — v0.25.52

Reader shares a minimal EV snapshot with Planner in session storage for the current
tab. Planner also accepts SoulSilver saves directly. Matching party/PC Pokémon,
including earlier evolutions and excluding eggs, show all current EVs, totals,
remaining target values and automatic completion. Duplicate matches require a
selection; unmatched members retain manual progress. Planned targets stay fixed.
Invalid Planner uploads preserve previous values. Raw saves are never persisted
or uploaded. Reload the latest save after training.

All 78 automated checks pass, including Reader/Atlas/Planner regressions and
EV snapshot refresh, duplicate selection and invalid replacement. Publication
pending; real-save and user validation pending.

## Current non-Safari Atlas audit — 20 October 2026

The [integrated audit](docs/atlas-integrated-audit-2026-10-20.md) reviews the current
v0.25.66 Atlas, including all 69 existing non-Safari locations. All 150 tests pass,
162 reference pages were rechecked, encounter/EV/map exports reproduce unchanged,
and all 365 fixed/combined trainer rosters match pinned primary species/levels.
No confirmed data correction was needed. The report distinguishes that evidence
from remaining Kanto/Sinjoh coverage, building/Gym interior maps, per-connection
HM/story indicators, battle-reference depth and progression filtering. Safari
content/mechanics are excluded. Application files and version remain unchanged.

## Johto interior maps and travel conditions — v0.25.67

Atlas adds 42 interior choices (all eight Gyms plus named/shared interior
references) across 14 existing location groups. The catalogue now contains 192
views and 175 PNG assets. Use Map / area to select a Gym, lab, house or service
interior; reference/shared views are labelled. Some ordinary rooms still lack
verified released-HGSS artwork, so this is not yet every building floor plan.

Travel buttons now show HM/story/path symbols, with precise descriptions under
Travel conditions. All 154 directed non-Safari connections are reviewed, including
alternative paths, through-route versus entrance requirements and one-way ledges.
The reference remains freely navigable; automatic saved-progression filtering is
not added. All 154 tests pass. Safari content, encounters, reference records and
EV yields are unchanged. See [coverage, evidence and remaining gaps](docs/atlas-johto-interiors-travel.md).

## Remaining Johto building references — v0.25.68

The Atlas map selector now includes Kurt’s house, Cianwood Pharmacy, Dance Theater,
ordinary houses, gatehouses, Center basements, station floors, ship cabins and
facility rooms. All 173 scoped building-room headers have an image/reference:
70 use existing artwork and 103 use clearly labelled **game-data terrain plans**.
There are 295 choices / 278 PNG assets in the same 69 non-Safari location groups.

Terrain plans show static tile collision flags and exit/stair coordinates, not
screenshots or complete movement rules. Objects, height and scripts can affect
movement. Their source links and caveats remain visible; the existing overview
images and location-level encounters are preserved. Kanto expansion and Safari
remain separate. See [scope, reproduction and coverage](docs/atlas-johto-interior-completion.md).

## Whirl Islands stair connections — v0.25.69

Matching **A–F** markers connect the existing NW/NE/SW/SE entrance maps to B1F.
Click a letter or the stair list to open and highlight its other end. **Open
full-size map with stair links** keeps the markers on an enlarged, scrollable map,
with the shared theme and keyboard/phone controls. The original maps are retained.

All six entrance/B1F ladder pairs are verified against the HGSS game warps in both
directions. The lower-floor ladders and cave exits are outside this focused
overlay. See [usage, evidence and scope](docs/whirl-islands-stair-links.md).

## More cave links and mobile travel help — v0.25.70

Matching letters now follow **50 additional stair/passage pairs across ten more
caves**, including Union Cave, Mt. Mortar, Ice Path, Victory Road and Mt. Silver.
The enlarged map retains the markers and keeps Close map available while scrolling.
Four labelled terrain plans cover small connecting/entrance rooms missing from the
existing images. The catalogue now has 299 views / 282 PNG assets.

**On mobile, tap the Surf/Strength/other symbols to open and highlight that
connection’s requirements. Tap the destination name to travel.** Travel conditions
below the map also remains available to touch, keyboard and screen-reader users.
HM rules and encounter data are unchanged. See [coverage and evidence](docs/cave-map-links.md).

## Towers, lower Whirl Islands and one-way holes — v0.25.71

Map connections now include Sprout Tower, Burned Tower, Bell Tower's stairs and
teleport pads, and Whirl Islands down to both deepest chambers. This adds 27
reciprocal pairs. Nine scripted holes in Ice Path and Victory Road use separate
**D1↓** markers with landing-only indicators, so they never offer reverse travel.
Bell Tower's same-floor pads identify both sides and work in the full-size viewer.
The existing artwork, encounter data and map catalogue remain unchanged.
See [coverage, controls and verification](docs/dungeon-map-links.md).
