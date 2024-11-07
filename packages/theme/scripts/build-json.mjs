import { StyleDictionary } from "style-dictionary-utils";

// TODO: add more styling options here, and theme vs theme next
function getStyleDictionaryConfig({ mode, density, accent }) {
  return {
    source: [
      //   "./tokens/foundation/test.tokens.json",
      "./tokens/foundation/**/*.tokens.json",
      `./tokens/palette/${accent}-${mode}.tokens.json`,
      //   `./tokens/characteristics/*.tokens.json`,
      //   "tokens/globals/**/*.tokens.json",
    ],
    // usesDtcg: true,
    platforms: {
      css: {
        buildPath: `dist/css/${accent}-${mode}-${density}/`,
        prefix: "salt",
        transforms: [
          "attribute/cti",
          "name/kebab",
          // "dimension/pixelToRem",
          //   "color/hexAlpha", // style-dictionary-utils transform // doesn't work with $value for some reason
        ],
        files: [
          {
            format: "css/advanced",
            destination: "variables.css",
            options: {
              selector: ".salt-theme.salt-theme-next", // defaults to :root; set to false to disable
              //   rules: [
              //     {
              //       atRule: "@media (min-width: 768px)",
              //       selector: `body[size="medium"]`, // this will be used instead of body[theme="dark"]`
              //       matcher: (token) => token.filePath.includes("tablet"), // tokens that match this filter will be added inside the media query
              //     },
              //   ],
              outputReferences: true,
              usesDtcg: true,
              formatting: {
                // prefix: "color", // this defaults to `--`
              },
            },
            // // Use filter to add different `selector` for mode/density/etc.
            // filter: {},
          },
        ],
      },
    },
  };
}

for await (const mode of ["light"]) {
  for await (const accent of ["blue"]) {
    // , "md", "ld", "td"
    for await (const density of ["hd"]) {
      const config = getStyleDictionaryConfig({ mode, density, accent });
      // const myStyleDictionary = new StyleDictionary();

      // const extendedSd = await myStyleDictionary.extend(config);

      // await extendedSd.buildAllPlatforms();

      // const sd = new StyleDictionary(config);
      // await sd.buildAllPlatforms();
      const myStyleDictionary = new StyleDictionary();
      const sd = await myStyleDictionary.extend(config);
      sd.buildAllPlatforms();
    }
  }
}
