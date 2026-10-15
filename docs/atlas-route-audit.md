# SoulSilver route encounter and feature audit — v0.25.41

## Scope and outcome

Reviewed all **23 existing numbered routes, 26–48**. This milestone precedes the
Safari Zone milestone at the user's request. It fills six entirely absent route
tables (26–31), replaces the older 32–48 tables, and adds detailed route items,
Apricorns, useful NPC interactions and trainer identities/conditions.

The previous v0.25.37 static audit checked names, summaries, landmarks, access and
connections. It did **not** audit encounters or claim an exhaustive item/NPC
inventory. Its historical evidence remains unchanged.

Route data now lives under `js/data/games/soulsilver/`, selected explicitly by game
ID through `atlas-route-reference.js`. Unsupported games return no data rather
than silently using SoulSilver. This prepares future game support without adding
another supported game or generalizing the Reader/parser.

## Evidence and decisions

Both Serebii and Bulbapedia returned HTTP 200 for every route. The machine-readable
[audit](atlas-route-audit.json) records each reference URL, downloaded-page hash,
per-route counts, discrepancies and pinned primary evidence. Reference sections
were restricted to HGSS/SoulSilver, excluding Generation II, HeartGold-only and
demo-only records.

Disagreements were resolved using pret/pokeheartgold revision
[`d2355244ac42b3c6e40d8c36aa3564ee8706dea4`](https://github.com/pret/pokeheartgold/tree/d2355244ac42b3c6e40d8c36aa3564ee8706dea4):

- `files/fielddata/encountdata/gs_enc_data.json`: resolve all `SOULSILVER` overrides;
  Routes 40 and 41 use banks `W40`/`W41`, not nonexistent `R40`/`R41`.
- `src/field/encounter_check.c`: actual method weights, time changes, radio slot
  replacements, nighttime fishing and outbreak replacements. Fishing slot weights
  are 40/30/15/10/5; older references often use 60/30/5/4/1 or 70/30 instead.
- `files/arc/headbutt.json` and `src/field/headbutt.c`: resolve `silver` overrides;
  distinguish normal groups A/B and special trees. Only groups with actual trees
  are exposed. Rock Climb gates the special trees on Routes 38/47.
- `src/unk_02097F6C.c`: only routes in the real outbreak lookup receive outbreak
  entries. Placeholder swarm species in other banks are not treated as outbreaks.
- Route event files/scripts: resolve item and named-interaction discrepancies,
  including Cameron's schedule and visiting Gym Leader photo conditions.

Examples of corrections/clarifications:

- Route 29 now shows Pidgey, Sentret and Rattata by daytime period; Hoothoot at
  night; radio species; and both SoulSilver Headbutt groups including Ledyba.
  SoulSilver-specific daytime slot/level differences are preserved even where
  the two reference pages reuse the morning range. Plusle/Minun radio levels use
  the actual replaced slots, resolving Bulbapedia's reversed level listing.
- Old Rod Magikarp is normally 85%, not 95%, in the audited water-route tables.
  Route 32's Qwilfish outbreak is fishing, not Surfing: 15% Old Rod, 65% Good Rod,
  100% Super Rod. Route 27's Luvdisc outbreak is Surfing.
- Route 41 excludes HeartGold-only Mantine. Route 46 excludes Serebii's unsupported
  Ekans Headbutt listing; both the game tables and Bulbapedia omit it.
- Precise discrete levels are retained: e.g. level 2 **or** 4 is displayed as
  `2, 4`, not `2–4`. Water tables with a normal band and a separate high-level slot
  also retain their gaps. Species percentages combine that species' slots;
  they do not claim uniform probability across its displayed level set.
- Route 35 includes Webster's level-20 Kenya with its Mail delivery condition;
  Route 36 keeps the one-time level-20 Sudowoodo interaction and SquirtBottle gate.
- Route 26's ground item is Max Elixir (event flag
  `FLAG_HIDE_ITEMBALL_R26_MAX_ELIXIR`), despite Serebii calling it PP Max. The hidden
  boundary Nugget remains described under Route 27, accessible from Route 26.
- The MooMoo Farm requirement remains seven Oran Berries; Serebii's five-Berry Seal
  Case note is not adopted. Route 34 uses HGSS's Power Herb and Taunt rewards,
  not Generation II's Soft Sand and Sweet Scent.
- Apricorn colors, daily collection, hidden items, Surf/Cut/Whirlpool/Rock Climb
  conditions, weekday siblings, named gifts and phone contacts are exposed in
  expandable route sections. The route search includes their text.

Some machine-recorded differences are simply reference range imprecision. These
are resolved by retaining the actual level set. Conditional rows show the affected
species' share under that condition; they are not complete replacement
probability tables for every combination of radio and outbreak. The explanatory
note distinguishes species shares from step rates, fishing bites, tree activation,
ability effects and Repel.


## Route inventory

| Route | Encounter records | Item/Apricorn records |
| --- | ---: | ---: |
| Route 26 | 29 | 3 |
| Route 27 | 30 | 8 |
| Route 28 | 26 | 3 |
| Route 29 | 16 | 5 |
| Route 30 | 27 | 10 |
| Route 31 | 28 | 15 |
| Route 32 | 33 | 13 |
| Route 33 | 16 | 2 |
| Route 34 | 27 | 15 |
| Route 35 | 28 | 6 |
| Route 36 | 20 | 10 |
| Route 37 | 17 | 5 |
| Route 38 | 20 | 5 |
| Route 39 | 16 | 9 |
| Route 40 | 12 | 4 |
| Route 41 | 12 | 2 |
| Route 42 | 22 | 9 |
| Route 43 | 27 | 4 |
| Route 44 | 26 | 9 |
| Route 45 | 21 | 10 |
| Route 46 | 13 | 4 |
| Route 47 | 35 | 6 |
| Route 48 | 18 | 1 |

## Reproduction and validation

With the pinned primary repository checked out locally:

```sh
python scripts/build-soulsilver-route-encounters.py /path/to/pokeheartgold
npm test
```

The generator requires Python's standard library only and checks the source
revision. Feature prose is independently maintained from the reviewed reference
facts. Tests cover all route distributions/methods, precise level formatting,
SoulSilver version differences, outbreaks, gifts, game isolation, Route 29 content,
expandable information/search, responsive navigation and Reader/Planner regressions.

## Boundary and acceptance

This completes the **existing numbered route reference milestone**, not the whole
Atlas. Other towns/dungeons and the Safari Zone retain their previous encounter
data and audit status. Full Kanto expansion, remaining maps, trainer party/battle
strategy references and the Safari simulator are separate milestones. Roamers are
explained as moving encounters rather than invented fixed route tables.

Automated checks do not substitute for in-game validation. User acceptance of
v0.25.41 on the existing Pages site remains pending.
