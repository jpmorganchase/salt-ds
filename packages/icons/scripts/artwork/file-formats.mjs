import { F, S, textLabel } from "./primitives.mjs";

// File extensions share one open page silhouette and external three-letter
// baseline. Keeping the label outside the page leaves useful counters at 16px.
const fileFormats = {};
const page = S("M3.75 12V2.25h10.5l6 6V12M14.25 2.25v6h6");
// Both variants share the open frame; only the folded corner fills.
const solidPage = page + F("M14.25 2.25l6 6h-6Z");
for (const name of ["csv", "pdf", "xls", "zip"]) {
  const text = textLabel(name.toUpperCase(), 12, 15, 6.9, { align: "center" });
  fileFormats[name] = [page + text, solidPage + text];
}
export default fileFormats;
