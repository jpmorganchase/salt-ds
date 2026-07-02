// This file is intentionally inert.
//
// The salt-icons font is built by `scripts/build-icons.mjs`, which composes
// glyphs declared in `icons.manifest.cjs` (Salt sources from @salt-ds/icons +
// local customs) into a staging directory and invokes fantasticon's
// programmatic API. There is no `inputDir` on disk that contains every glyph,
// so running `fantasticon --config ./fantasticonrc.cjs` directly would
// produce an incomplete font.
//
// To regenerate the font:
//
//     yarn workspace @salt-ds/ag-grid-theme run regen-icons
//
throw new Error(
  "fantasticonrc.cjs is not the entry point for the salt-icons font. " +
    "Run `yarn workspace @salt-ds/ag-grid-theme run regen-icons` " +
    "(driven by scripts/build-icons.mjs and icons.manifest.cjs).",
);
