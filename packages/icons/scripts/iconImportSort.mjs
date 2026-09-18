import path from "node:path";

/** Change kebab casing to Pascal casing. */
export function pascalCase(value) {
  return value
    .split("-")
    .map(
      (part) =>
        part.charAt(0).toLocaleUpperCase("en-US") +
        part.slice(1).toLocaleLowerCase("en-US"),
    )
    .join("");
}

/** Convert an SVG filename into the component stem used by the generator. */
export function svgFileNameToComponentName(fileName) {
  const filenameWithoutExtension = path.parse(fileName).name;
  return pascalCase(filenameWithoutExtension.split("_").join("-"));
}

/** Turn `AppleBanana` into `Apple Banana`. */
export function breakPascalCasingWithSpace(value) {
  if (!value) {
    return value;
  }
  return value.charAt(0) + value.slice(1).replaceAll(/([A-Z])/g, " $1");
}

const collator = new Intl.Collator("en", { numeric: true });

/** Match Biome's natural import ordering while remaining host-locale neutral. */
export function importSortPredicate(left, right) {
  return collator.compare(
    breakPascalCasingWithSpace(left),
    breakPascalCasingWithSpace(right),
  );
}
