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
