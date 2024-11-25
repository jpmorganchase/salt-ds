export const foundationCategoricalFile = {
  format: "css/advanced",
  destination: "foundations/color.css",
  options: {
    selector: ".salt-theme", // defaults to :root; set to false to disable
    outputReferences: true,
    usesDtcg: true,
  },
  // // Use filter to add different `selector` for mode/density/etc.
  filter: async (token, options) => {
    //   console.log(token, options)
    return (
      (token.filePath.includes("colors-categorical.tokens") ||
        token.filePath.includes("colors.tokens")) &&
      token.attributes.type !== "figma-only"
    );
  },
};
