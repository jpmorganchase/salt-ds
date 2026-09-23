import a from "./a.mjs";
import architecture from "./architecture.mjs";
import b from "./b.mjs";
import bookmarks from "./bookmarks.mjs";
import c from "./c.mjs";
import cloudActions from "./cloud-actions.mjs";
import d from "./d.mjs";
import fileFormats from "./file-formats.mjs";
import referenceControls from "./reference-controls.mjs";
import referenceFrames from "./reference-frames.mjs";
import referenceSymbols from "./reference-symbols.mjs";
import { iconAliases } from "./view-box.mjs";

export const drawings = {};
// Each meaning has one owning recipe; aliases are assigned separately.
for (const batch of [
  a,
  b,
  c,
  d,
  architecture,
  bookmarks,
  referenceSymbols,
  referenceFrames,
  referenceControls,
  cloudActions,
  fileFormats,
]) {
  for (const [name, pair] of Object.entries(batch)) {
    if (drawings[name]) throw new Error(`Duplicate drawing: ${name}`);
    drawings[name] = pair;
  }
}
// Deprecated aliases follow their supported replacement. The historic filled
// step-success badge is retained by its drawing recipe.
for (const [alias, canonical] of Object.entries(iconAliases)) {
  if (drawings[alias]) throw new Error(`Duplicate drawing: ${alias}`);
  drawings[alias] = drawings[canonical];
}
