import { StyleDictionary } from "style-dictionary-utils";
import {
  foundationAlphaNextFile,
  foundationColorsNextFile,
  getCharacteristicsNextFiles,
  getFoundationCurveNextFile,
  getPaletteNextFiles,
} from "./sd-utils/files/theme-next-tokens.mjs";
import { foundationCategoricalFile } from "./sd-utils/files/theme-tokens.mjs";
import { cssMultiModes } from "./sd-utils/format/css-multi-modes.mjs";
import { saltNameKebab } from "./sd-utils/transform/name-kebab.mjs";
import {
  saltValueModes,
  saltValuePx,
} from "./sd-utils/transform/value-modes.mjs";

// TODO: add more styling options here, and theme vs theme next
function getStyleDictionaryConfig({ modes, densities, accents }) {
  return {
    source: [
      //   "./tokens/foundation/test.tokens.json",
      "./tokens/foundation/*.tokens.json", // not include foundation/src/*
      // // Individual palette file output

      "./tokens/palette/text.tokens.json",
      "./tokens/palette/palette-next.tokens.json",
      // // combined palette tokens into single file, handled by custom formatter
      // "./tokens/palette/**/*.tokens.json",
      "./tokens/characteristics/*.tokens.json",
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
          "salt-ds/value/px",
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
          getFoundationCurveNextFile({ densities }),
          ...getPaletteNextFiles({ modes, densities, accents }),
          ...getCharacteristicsNextFiles(),
        ],
      },
    },
  };
}

const modes = ["light", "dark"];
const accents = ["blue", "teal"];
const densities = ["high", "medium", "low", "touch"];

const config = getStyleDictionaryConfig({ modes, densities, accents });

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
saltStyleDictionary.registerTransform(saltValuePx);

// Custom transform - https://styledictionary.com/reference/hooks/transforms/
saltStyleDictionary.registerTransform(saltNameKebab);
const sd = await saltStyleDictionary.extend(config);
sd.cleanAllPlatforms();
sd.buildAllPlatforms();
