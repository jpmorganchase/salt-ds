import { kebabCase } from "change-case";
import { StyleDictionary } from "style-dictionary-utils";
import { cssMultiModes } from "./sd-utils/format/css-multi-modes.mjs";

// TODO: add more styling options here, and theme vs theme next
function getStyleDictionaryConfig({ modes, density, accent }) {
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

      "./tokens/palette/blue-dark-next.tokens.json", // TODO: revert to accent-mode aware
      // `./tokens/palette/${accent}-${mode}-next.tokens.json`,
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
          // TODO: different mode-accent will override each other right now.
          // Inpire from `atRule` option, to work out multiple modes in a single file?
          // https://github.com/lukasoppermann/style-dictionary-utils/blob/main/src/format/css-advanced.ts
          // Not really, SD will warn Collision detected, and only use one value at a time, we need to come up with custom syntax to make this work
          ...paletteNextList.map((paletteNextType) => ({
            format: "salt-ds/css/multi-modes",
            // format: "css/advanced",
            destination: `palette/${paletteNextType}-next.css`,
            options: {
              // selector: `.salt-theme.salt-theme-next[data-mode="${mode}"][data-accent="${accent}"]`, // defaults to :root
              outputReferences: true,
              usesDtcg: true,
              rules: modes.map((mode) => ({
                selector: `.salt-theme.salt-theme-next[data-mode="${mode}"][data-accent="${accent}"]`,
                // matcher: (token) =>
                //   token.filePath.includes(mode) &&
                //   token.filePath.includes(accent),
                modeIdentifier: mode,
              })),
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
          })),
        ],
      },
    },
  };
}

// Regexps involved with splitting words in various case formats.
const SPLIT_LOWER_UPPER_RE = /([\p{Ll}\d])(\p{Lu})/gu; // ( lower case + digit ) ( upper case )
const SPLIT_LOWER_NON_DIGIT_UPPER_RE = /([\p{Ll}])(\p{Lu})/gu; // ( lower case  ) ( upper case )
const SPLIT_UPPER_UPPER_RE = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu; // ( upper case ) ( [ upper case ] [ lower case ] )
// The replacement value for splits.
const SPLIT_REPLACE_VALUE = "$1\0$2";

// Regexp involved with stripping non-word characters from the result.
const DEFAULT_STRIP_REGEXP = /[^\p{L}\d]+/giu;

const modes = ["light", "dark"];
// for await (const mode of ["dark"]) {
for await (const accent of ["blue"]) {
  // , "md", "ld", "td"
  for await (const density of ["hd"]) {
    const config = getStyleDictionaryConfig({ modes, density, accent });

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
    saltStyleDictionary.registerTransform({
      type: "value",
      // if `transitive` is not here, `transform` is not being called...
      transitive: true,
      name: "salt-ds/value/modes",
      filter: (token, options) => {
        return token.$modes !== undefined;
        // const filterCondition =
        //   token.filePath.includes("-next.tokens") &&
        //   token.path[0] === "palette";
        // console.log("salt-ds/value/modes filter", filterCondition, token);
        // return filterCondition;
      },
      transform: (token, _, options) => {
        console.log("salt-ds/value/modes transform", token);
        // debugger;
        if (
          // token.path.includes("palette")
          token.attributes.category === "palette" &&
          token.attributes.type === "accent" &&
          token.attributes.item === "stronger"
        ) {
          console.log("palette accent stronger", token);
        }

        return token.$modes; // how to work out `.light` here?
      },
    });

    // Custom transform - https://styledictionary.com/reference/hooks/transforms/
    saltStyleDictionary.registerTransform({
      name: "salt-ds/name/kebab",
      type: "name",
      transitive: true,
      transform: (token, config) => {
        // attributes: { category: 'color', type: 'alpha',
        if (
          token.path.includes("alpha") &&
          token.attributes.category === "color" &&
          token.attributes.type === "alpha"
        ) {
          const alphaIndex = token.path.findIndex((p) => p === "alpha");
          const alphaRemovedPath = [
            ...token.path.slice(0, alphaIndex),
            ...token.path.slice(alphaIndex + 1),
          ];
          // console.log("Token path with alpha removed", alphaRemovedPath);

          function splitPrefixSuffix(input) {
            const splitFn = modifiedSplit;
            const prefixIndex = 0;
            const suffixIndex = input.length;

            return [
              input.slice(0, prefixIndex),
              splitFn(input.slice(prefixIndex, suffixIndex)),
              input.slice(suffixIndex),
            ];
          }

          function specialKebab(input) {
            const [prefix, words, suffix] = splitPrefixSuffix(input);
            return (
              prefix +
              words.map((input) => input.toLowerCase()).join("-") +
              suffix
            );
          }

          function modifiedSplit(value) {
            let result = value.trim();

            result = result
              // `SPLIT_LOWER_NON_DIGIT_UPPER_RE` changed compare with 'change-case' original split
              // Change to not split 30A -> 30-A
              .replace(SPLIT_LOWER_NON_DIGIT_UPPER_RE, SPLIT_REPLACE_VALUE)
              .replace(SPLIT_UPPER_UPPER_RE, SPLIT_REPLACE_VALUE);

            result = result.replace(DEFAULT_STRIP_REGEXP, "\0");

            let start = 0;
            let end = result.length;

            // Trim the delimiter from around the output string.
            while (result.charAt(start) === "\0") start++;
            if (start === end) return [];
            while (result.charAt(end - 1) === "\0") end--;

            return result.slice(start, end).split(/\0/g);
          }

          const name = specialKebab(
            [config.prefix].concat(alphaRemovedPath).join(" "),
          );
          console.log("salt-ds/name/kebab specialKebab name", name, token);
          return name;
        }
        const name = kebabCase([config.prefix].concat(token.path).join(" "));
        console.log("salt-ds/name/kebab name", name, token);
        return name;
      },
    });
    const sd = await saltStyleDictionary.extend(config);
    sd.cleanAllPlatforms();
    sd.buildAllPlatforms();
  }
}
// }
//
