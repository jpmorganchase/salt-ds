export const foundationColorsNextFile = {
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
      token.attributes.type !== "figma-only"
    );
  },
};

export const foundationAlphaNextFile = {
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
      token.attributes.type === "alpha" &&
      token.attributes.type !== "figma-only"
    );
  },
};

// 2 sets of palette files set, one with 4 $modes ('blue/teal-light/dark'), one with 2 $modes ('light/dark')
export const paletteNextFiles = [
  ...paletteNextList.map((paletteNextType) => {
    const accentModeRules = modes.reduce((prev, mode) => {
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

    return {
      format: "salt-ds/css/multi-modes",
      destination: `palette/${paletteNextType}-next.css`,
      options: {
        outputReferences: true,
        usesDtcg: true,
        rules: accentModeRules,
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
          token.path[1] === paletteNextType &&
          // dirty way to match 'blue/teal-light/dark'
          Object.keys(token.$modes).every((x) => x.includes("-")) &&
          token.attributes.type !== "figma-only"
        );
      },
    };
  }),
  ...paletteNextList.map((paletteNextType) => {
    const modeOnlyRules = modes.map((mode) => ({
      selector: `.salt-theme.salt-theme-next[data-mode="${mode}"]`,
      modeIdentifier: mode,
    }));

    return {
      format: "salt-ds/css/multi-modes",
      destination: `palette/${paletteNextType}-next.css`,
      options: {
        outputReferences: true,
        usesDtcg: true,
        rules: modeOnlyRules,
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
          token.path[1] === paletteNextType &&
          // dirty way to NOT match 'blue/teal-light/dark'
          !Object.keys(token.$modes).every((x) => x.includes("-")) &&
          token.attributes.type !== "figma-only"
        );
      },
    };
  }),
];
