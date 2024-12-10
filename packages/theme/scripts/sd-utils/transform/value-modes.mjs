/** Not used */
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

function isNumber(token, options) {
  // console.log("salt-ds/value/px isNumber", JSON.stringify(token));
  return typeof (options.usesDtcg ? token.$value : token.value) === "number";
}

export const saltValuePx = {
  name: "salt-ds/value/px",
  type: "value",
  filter: (token, options) => isNumber(token, options),
  transform: (token, _, options) => {
    // this is a "hack"..? for those getting value from "salt-ds/css/multi-modes"
    // value should be transformed on $modes as well
    // console.log("salt-ds/value/px transform", JSON.stringify(token));

    if (token.$modes) {
      for (const mode of Object.keys(token.$modes)) {
        const modeValue = token.$modes[mode];
        if (typeof modeValue === "number") {
          token.$modes[mode] = `${modeValue}px`;
        }
      }
    }

    const value = options.usesDtcg ? token.$value : token.value;
    const parsedVal = Number.parseFloat(value);
    if (Number.isNaN(parsedVal)) throwSizeError(token.name, value, "px");
    // console.log(
    //   "salt-ds/value/px transform",
    //   "parsedVal",
    //   parsedVal,
    //   JSON.stringify(token),
    // );
    return `${parsedVal}px`;
  },
};
