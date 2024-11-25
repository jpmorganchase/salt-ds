import { StyleDictionary } from "style-dictionary-utils";
import {
  foundationAlphaNextFile,
  foundationColorsNextFile,
  getPaletteNextFiles,
} from "./sd-utils/files/theme-next-tokens.mjs";
import { foundationCategoricalFile } from "./sd-utils/files/theme-tokens.mjs";
import { cssMultiModes } from "./sd-utils/format/css-multi-modes.mjs";
import { saltNameKebab } from "./sd-utils/transform/name-kebab.mjs";
import { saltValueModes } from "./sd-utils/transform/value-modes.mjs";

// TODO: add more styling options here, and theme vs theme next
function getStyleDictionaryConfig({ modes, density, accents }) {
  return {
    source: [
      //   "./tokens/foundation/test.tokens.json",
      "./tokens/foundation/**/*.tokens.json",
      // // Individual palette file output

      "./tokens/palette/palette-next.tokens.json",
      // // combined palette tokens into single file, handled by custom formatter
      // "./tokens/palette/**/*.tokens.json",
      //   `./tokens/characteristics/*.tokens.json`,
      //   "tokens/globals/**/*.tokens.json",
    ],
    // usesDtcg: true,
    platforms: {
      css: {
        buildPath: "dist/css/",
        prefix: "salt",
        transforms: [
          "attribute/cti",
          "salt-ds/name/kebab", // Custom transform, see below
          // "name/kebab", // https://github.com/amzn/style-dictionary/blob/0fcf229f78e334a5c6bec55725fe92a8de97590c/lib/common/transforms.js#L320-L325
          // "dimension/pixelToRem",
          //   "color/hexAlpha", // style-dictionary-utils transform // doesn't work with $value for some reason
          // // when below is enabled, palette CSS output `--strong disabled` which is invalid, however kebab name transform is being called ....
          // "salt-ds/value/modes",
        ],
        files: [
          foundationCategoricalFile,
          foundationColorsNextFile,
          foundationAlphaNextFile,
          ...getPaletteNextFiles({ modes, density, accents }),
        ],
      },
    },
  };
}

const modes = ["light", "dark"];
const accents = ["blue", "teal"];
// for await (const mode of ["dark"]) {
// , "md", "ld", "td"
for await (const density of ["hd"]) {
  const config = getStyleDictionaryConfig({ modes, density, accents });

  const saltStyleDictionary = new StyleDictionary(
    {},
    { verbosity: "verbose" }, // for debug
  );
  // TODO: custom file header - https://styledictionary.com/reference/hooks/file-headers/

  saltStyleDictionary.registerFormat({
    name: "salt-ds/css/multi-modes",
    format: cssMultiModes,
  });

  // TODO: find out why when `value` transform is provided, name is broken
  // This is currently not used, but would be good to understand regardless
  saltStyleDictionary.registerTransform(saltValueModes);

  // Custom transform - https://styledictionary.com/reference/hooks/transforms/
  saltStyleDictionary.registerTransform(saltNameKebab);
  const sd = await saltStyleDictionary.extend(config);
  sd.cleanAllPlatforms();
  sd.buildAllPlatforms();
}
