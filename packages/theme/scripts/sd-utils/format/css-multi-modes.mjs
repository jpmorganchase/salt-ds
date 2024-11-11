import { format } from "prettier";
// import type { FormatFn, FormatFnArguments, FormattingOptions, TransformedToken } from 'style-dictionary/types'
import { fileHeader, formattedVariables } from "style-dictionary/utils";

/**
 * @param {import("style-dictionary/types").FormatFnArguments} param0
 * @returns {import("style-dictionary/types").FormatFn}
 */
export const cssMultiModes = async ({
  dictionary: originalDictionary,
  options = {
    rules: [],
  },
  file,
}) => {
  // get options
  const { outputReferences, formatting, usesDtcg } = options;
  // selector
  const defaultSelector =
    file?.options?.selector !== undefined ? file?.options?.selector : ":root";
  // get queries from file options
  const rules = file?.options?.rules || [
    {
      selector: undefined,
      matcher: () => true,
    },
  ];
  // set formatting
  const mergedFormatting = {
    commentStyle: "long",
    ...formatting,
  };
  // clone dictioxnary
  const dictionary = { ...originalDictionary };

  // add file header
  const output = [await fileHeader({ file })];
  // add single theme css
  for (const { selector, matcher } of rules) {
    let preludes = [selector];

    // remove invalid preludes
    preludes = preludes.filter(Boolean);
    // filter tokens to only include the ones that pass the matcher
    const filteredDictionary = {
      ...dictionary,
      allTokens: dictionary.allTokens.filter(matcher || (() => true)),
    };
    // early abort if no matches
    if (!filteredDictionary.allTokens.length) continue;
    // add tokens into root
    const css = formattedVariables({
      format: "css",
      dictionary: filteredDictionary,
      outputReferences,
      formatting: mergedFormatting,
      usesDtcg,
    });
    // additional modes
    let cssWithSelector = css;
    for (const prelude of preludes.reverse()) {
      cssWithSelector = `${prelude} { ${cssWithSelector} }`;
    }
    // add css with or without query
    output.push(cssWithSelector);
  }
  // return prettified
  return format(output.join("\n"), { parser: "css", printWidth: 500 });
};
