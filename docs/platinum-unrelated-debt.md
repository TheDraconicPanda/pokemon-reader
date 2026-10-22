# Legacy debt retained outside the Platinum expansion

- SoulSilver's original profile selects PC data in the active general partition.
  PKHeX's shared SAV4 implementation selects block positions independently; a
  broader damaged-save recovery change needs native HGSS counter/recovery fixtures
  and is not inferred from Platinum's distinct footer/counter policy. The existing
  conservative rejection of a damaged/mixed-copy SoulSilver save is retained;
  ordinary valid SoulSilver parser output remains exactly regression-tested.
  Reference: pinned [PKHeX SAV4 constructor/block selection](https://github.com/kwsch/PKHeX/blob/a9ff30657073b26825929a65ef58e61f99a1fe6f/PKHeX.Core/Saves/SAV4.cs).
- Node emits a module-type warning for this repository's mixed CommonJS tests and
  browser ES modules. Changing package-wide module classification would affect
  unrelated tools; successful executable checks remain the validation criterion.

These are not regressions introduced by the Platinum expansion or claims that
arbitrary damaged saves can be repaired. No new recovery or packaging scope is
introduced in the final release.
