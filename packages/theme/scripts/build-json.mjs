import { StyleDictionary } from "style-dictionary-utils";
import { cssMultiModes } from "./sd-utils/format/css-multi-modes.mjs";
import { saltNameKebab } from "./sd-utils/transform/name-kebab.mjs";
import { saltValueModes } from "./sd-utils/transform/value-modes.mjs";

// TODO: add more styling options here, and theme vs theme next
function getStyleDictionaryConfig({ modes, density, accents }) {
  const paletteNextList = [
    "accent",
    "corner",
    "negative",
    "text",
    "alpha",
    "foreground",
    "neutral",
    "warning",
  ];

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
          {
            format: "css/advanced",
            destination: "foundation/color.css",
            options: {
              selector: ".salt-theme", // defaults to :root; set to false to disable
              outputReferences: true,
              usesDtcg: true,
            },
            // // Use filter to add different `selector` for mode/density/etc.
            filter: async (token, options) => {
              //   console.log(token, options)
              return (
                token.filePath.includes("colors-categorical.tokens") ||
                token.filePath.includes("colors.tokens")
              );
            },
          },
          {
            format: "css/advanced",
            destination: "foundation/color-next.css",
            options: {
              selector: ".salt-theme.salt-theme-next", // defaults to :root; set to false to disable
              outputReferences: true,
              usesDtcg: true,
            },
            // // Use filter to add different `selector` for mode/density/etc.
            filter: async (token, options) => {
              // console.log(token, options);
              return (
                token.filePath.includes("colors-next.tokens") &&
                token.attributes.category === "color" &&
                !token.attributes.type === "alpha"
              );
            },
          },
          {
            format: "css/advanced",
            destination: "foundation/alpha-next.css",
            options: {
              selector: ".salt-theme.salt-theme-next", // defaults to :root; set to false to disable
              outputReferences: true,
              usesDtcg: true,
            },
            // // Use filter to add different `selector` for mode/density/etc.
            filter: async (token, options) => {
              // console.log(token, options);
              return (
                token.filePath.includes("colors-next.tokens") &&
                token.attributes.category === "color" &&
                token.attributes.type === "alpha"
              );
            },
          },
          // Inspire from `atRule` option, to work out multiple modes in a single file?
          // https://github.com/lukasoppermann/style-dictionary-utils/blob/main/src/format/css-advanced.ts
          // Not really, SD will warn Collision detected, and only use one value at a time, we need to come up with custom syntax to make this work
          ...paletteNextList.map((paletteNextType) => {
            const modeAccentRules = modes.reduce((prev, mode) => {
              // TODO: restructure `./palette/` files to per palette family, so that only those needing 4 combination (accents * modes) will generate 4 block of CSS code?
              // Or - should it be smarter when combining modes?
              for (const accent of accents) {
                prev.push({
                  selector: `.salt-theme.salt-theme-next[data-mode="${mode}"][data-accent="${accent}"]`,
                  modeIdentifier: `${accent}-${mode}`,
                });
              }
              return prev;
            }, []);
            console.log({ modeAccentRules });
            return {
              format: "salt-ds/css/multi-modes",
              // format: "css/advanced",
              destination: `palette/${paletteNextType}-next.css`,
              options: {
                // selector: `.salt-theme.salt-theme-next[data-mode="${mode}"][data-accent="${accent}"]`, // defaults to :root
                outputReferences: true,
                usesDtcg: true,
                rules: modeAccentRules,
              },
              // // Use filter to add different `selector` for mode/density/etc.
              filter: async (token, options) => {
                console.log("css/advanced filter", token); //palette-accent
                //  For some reason, attributes "attribute/cti" is not attached to tokens in palette
                return (
                  // next
                  token.filePath.includes("-next.tokens") &&
                  // platte
                  token.path[0] === "palette" && // or token.filePath.includes("/palette/") &&
                  //
                  token.path[1] === paletteNextType
                );
              },
            };
          }),
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
