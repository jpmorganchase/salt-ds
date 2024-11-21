export const saltValueModes = {
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
};
