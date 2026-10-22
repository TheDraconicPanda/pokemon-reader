# Kanto Atlas implementation

## Step 1 — geography and navigation, v0.25.80

52 new Kanto groups join the 70 existing groups. All 199 primary headers marked
Kanto are assigned to groups or explicitly excluded as unused. Rooms are grouped
under routes/cities or significant named buildings, consistent with Johto.
The independent inventory is `scripts/soulsilver-kanto-inventory.json`; regenerate
geography and the primary census with `python scripts/build-kanto-atlas.py PATH`.
Use the clean primary revision recorded in that inventory.

All groups are searchable and connected to New Bark Town, with explicit compass
orientations and directed HM/story annotations. The Magnet Train, S.S. Aqua and
Route 22 join the previously implemented Johto/League groups. Route 10 is a grouped
north/south reference: crossing requires Rock Tunnel, not a new surface shortcut.

Encounter data and Kanto maps are not certified by this geography milestone.
The next steps are encounter extraction, integrated presentation, and the final
machine-readable two-region audit. Historical Johto audits retain their original
scope and release rather than being relabelled as Kanto verification.

Real-save and in-game acceptance remain distinct from automated validation.

Validation: all 224 regression checks pass, plus the new Kanto landing/ship/phone
journey. The browser checks every Atlas connection. No real-save claim is made.

## Step 2 — encounter data, v0.25.81

The pinned primary extractor supplies 847 Kanto rows across all 52 new groups,
including separate Route 2/16 banks and all represented cave floors. It reuses the
existing SoulSilver slot rules, keeps morning/day/night and radio/outbreak rows
separate, and accounts for every primary Kanto map. Eight groups have no fixed
encounters; gifts, prizes and variable-level NPC trades are identified explicitly.
The reverse Pokédex location catalogue and EV finder use the same runtime data.

The five NPC trades are decoded from the primary trade archive. Gifts include
Oak’s Kanto starter choice, Steven’s Hoenn starter choice, Celadon’s three prizes
and seven fossil revivals, with transfer requirements retained. The historical
Enigma Stone Latias is not an ordinary SoulSilver roamer. Suicune’s return to
Burned Tower after an unsuccessful Route 25 encounter and another Hall of Fame
entry is included as a conditional continuation, not a second capture.

Reproduce with `python scripts/build-kanto-encounters.py PATH`. The evidence JSON
pins every input, per-map method accounting and runtime row hashes. Unused Route
12 Snorlax code and the noncatchable Clefairy dance are explicitly excluded.

Serebii Generation IV and Bulbapedia examples verify independent fixtures. Page
availability and remaining secondary uncertainties are recorded in
`atlas-kanto-reference-checks.json`; page retrieval is not represented as a full
row-by-row verification. Primary-scene water differences at Mt. Moon Square are
kept separate and labelled rather than combined into an invalid distribution.

Step 2 validation: all 227 automated checks pass. Source regeneration is byte-for-byte
reproducible; Safari data and mechanics remain unchanged.

## Step 3 — Atlas integration, v0.25.82

83 verified map choices cover all 52 new groups, including every Cerulean Cave and
Seafoam floor, Blaine’s relocated Gym, the other seven Kanto Gyms, and named
facility interiors. 57 archive layers retain original artwork; 26 primary terrain
plans explicitly show their limitations. Existing Johto PNGs and stair overlays
are unchanged. Reproduce with `python scripts/build-kanto-maps.py PRIMARY Kanto.zip`.

The shared renderer retains floor controls, desktop/mobile themes, accessible
navigation, save registrations and National Pokédex links. A regression fixture
checks Kanto Caught versus Seen/Owned distinctions and preserves the adventure
snapshot while browsing. All Kanto PNGs decode with their declared dimensions.
The reverse species catalogue now includes all 25 actual Latios roamer routes;
Route 25 remains excluded from roaming and retains its stationary Suicune story.
Ship conditions are directional, station entry is distinct from train service,
and Flash is an optional visibility aid in Rock Tunnel. No progression state is
invented from browsing. The separate Safari mechanics/simulator are unchanged.

Step 3 validation: all 230 checks pass, including every new PNG decode, shared
Reader/Planner/Safari regressions and Kanto registration/theme/phone checks.

## Step 4 — generated two-region audit, v0.25.83

The separate reference inventory derives from primary HGSS recipes, independently
audited Johto names/connections, the Kanto reference inventory and the existing
Safari audit. Its builder never reads the live Atlas location array or compiled
encounter tables. It accounts for 122 groups, 540 headers and 123 region/section
entries. Every grouped header and every intentional exclusion is reported.

`npm run validate:atlas` regenerates `docs/atlas-coverage.json` and runs the complete
suite. Missing locations cannot reduce its expected denominator. Mandatory checks
cover internal navigation, reachability, compass orientation, map assets/floors,
encounter fingerprints/species/levels/times/rates, special continuations, complete
display, source freshness, documented uncertainties and Safari compatibility.
Negative tests verify that defects actually fail. CI also rejects stale committed
report/input fingerprints and uploads the report plus TAP evidence.

Technical result: 63/63 Johto and 59/59 Kanto groups; 100% in each region and
122/122 overall. All 276 directed geographic connections and 92 existing floor
connections pass. The complete suite has 238 passing checks. All generators
reproduce unchanged output, and phone/desktop screenshots were inspected.

The final report explicitly distinguishes primary verification, older Johto
secondary audits, partial/new Kanto secondary retrieval, resolved source
conflicts and six remaining uncertainty categories. It does not assert complete
fresh row-by-row Serebii/Bulbapedia verification. See `atlas-coverage.md`.
Kanto cave floor selectors are available; existing on-image stair overlays remain
scoped to the previously audited Johto dungeons. Terrain plans are labelled
references, not complete movement simulations. No new Safari mechanics work is
included. Real-save outcomes and user/in-game acceptance remain separate.

All four steps completed the existing GitHub Pages deployment workflow. The final
application commit is `09c7b69`; [Pages run 39712052004](https://github.com/TheDraconicPanda/pokemon-reader/actions/runs/39712052004) completed successfully for v0.25.83.
A direct HTTP check of the production URL returned the environment proxy’s 403,
so a successful workflow is not represented as an independent live HTTP smoke test.

The new CI installation step is bounded to three minutes (ten minutes for the
job), with audit/funding lookups disabled. A clean isolated installation fetched
all 48 dependencies successfully. This CI-only follow-up leaves v0.25.83’s
application/data unchanged and retains all 238 passing release checks.
