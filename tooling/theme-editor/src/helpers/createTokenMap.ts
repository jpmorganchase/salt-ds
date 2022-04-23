/* eslint-disable */
//@ts-nocheck
type TokenMap = {
  label?: string;
  children?: TokenMap[];
  value?: any;
};

export function createTokenMap(toCreate: any): TokenMap[] {
  const tokenMap: TokenMap[] = [];

  // for each block of tokens
  for (const [r, rule] of toCreate.entries()) {
    // ignore e.g. @font-face for now
    if (rule.selectors) {
      var selectorName = "";
      // apply rule to all listed selectors
      if (
        rule.selectors.length === 4 &&
        rule.selectors.map((selector) => selector.includes("density"))
          .length === 4
      ) {
        selectorName = "density-all";
      }
      if (rule.selectors.length === 2) {
        if (
          rule.selectors.every(
            (value) => value.includes("light") || value.includes("dark")
          )
        ) {
          selectorName = "mode-all";
        }
      }
      for (const [selectorIndex, s] of rule.selectors.entries()) {
        if (!s.startsWith(".uitk-")) {
          break;
        }

        if (!["density-all", "mode-all"].includes(selectorName)) {
          selectorName = s.replace(".", "").split("-").slice(1).join("-");
        }

        if (!tokenMap.find((tk) => tk.label === selectorName)) {
          tokenMap.push({ label: selectorName, children: [] });
        }

        var selectorPath = tokenMap.find((i) => i.label === selectorName);

        // for each token in block
        for (const [, declaration] of rule.declarations.entries()) {
          // reset back to end of selector path
          var tokenPath = selectorPath;

          // Some can be comment
          if (declaration.type !== 'declaration') continue;

          var token = declaration.property.replace("--", "");
          var tokenParts: Array<string> = token.split("-");
          var cssValue = declaration.value;
          var prevPartFound;
          // for each part in token
          for (const [partIndex, tp] of tokenParts.entries()) {
            // go back to beginning of token
            prevPartFound = tokenPath;
            tokenPath = tokenPath?.children?.find((tk) => tk.label === tp);

            if (!tokenPath) {
              tokenPath = prevPartFound;
              var treeTokenPart: TokenMap = { label: tp, children: [] };
              if (partIndex === tokenParts.length - 1 && cssValue) {
                treeTokenPart.value = cssValue;
              }
              tokenPath?.children?.push(treeTokenPart);
              tokenPath = tokenPath?.children?.find((tk) => tk.label === tp);
            } else {
              if (
                !tokenPath.value &&
                partIndex === tokenParts.length - 1 &&
                cssValue
              ) {
                tokenPath.value = cssValue;
              }
            }
          }
        }
      }
    }
  }
  return tokenMap;
}
