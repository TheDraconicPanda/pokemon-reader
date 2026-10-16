# Pokémon Reader

A personal, browser-based tool for reading Pokémon game save files and exposing information that is normally hidden from the player.

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
