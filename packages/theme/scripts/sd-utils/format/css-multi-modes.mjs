import { format } from "prettier";
// import type { FormatFn, FormatFnArguments, FormattingOptions, TransformedToken } from 'style-dictionary/types'
import {
  fileHeader,
  formattedVariables,
  getReferences,
  sortByReference,
  usesReferences,
} from "style-dictionary/utils";

/**
 * if token.$modes exists
 *     if $modes[modeIdentifier]
 *         replace $value with $mode[option]
 */
function replaceModeSpecificValue(token, modeIdentifier) {
  if (!("$modes" in token)) {
    return token;
  }

  if (token.$modes?.[modeIdentifier]) {
    console.log("replaceModeSpecificValue token.$modes", token);
    token.$value = token.$modes?.[modeIdentifier];
  }
  return token;
}

// recursively traverse token objects and update
function updateToken(slice, modifyFn) {
  modifyFn(slice);
  Object.values(slice).forEach((value) => {
    if (typeof value === "object") {
      updateToken(value, modifyFn);
    }
  });
  return slice;
}

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

  console.log("salt-ds/css/multi-modes rules", rules);
  // add single theme css
  for (const { selector, matcher, modeIdentifier } of rules) {
    let preludes = [selector];

    // remove invalid preludes
    preludes = preludes.filter(Boolean);

    //
    // hack the system a bit:
    // replace filteredDictionary.tokens, token.original.$value with token.original.$mode
    // This approach has the consequence of needing all mode values existed given `$value` would be overridden
    // Otherwise, we need a custom `createPropertyFormatter` which can read values from `$modes` other than `$value`
    // TODO: can this be overcome by using custom parser and/or custom preprocessor?
    const updatedTokens = updateToken(dictionary.tokens, (t) =>
      replaceModeSpecificValue(t, modeIdentifier),
    );

    // filter tokens to only include the ones that pass the matcher
    const filteredDictionary = {
      ...dictionary,
      tokens: updatedTokens,
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

/**
 * =========== not used below this line, it's here to help experiements
 */

/**
 * Copy from style-dictionary@4.1.4: node_modules/style-dictionary/lib/common/formatHelpers/formattedVariables.js
 * No change apart from pointing to `customCreatePropertyFormatter`
 *
 * This is used to create lists of variables like Sass variables or CSS custom properties
 * @memberof module:formatHelpers
 * @name formattedVariables
 * @param {Object} options
 * @param {String} options.format - What type of variables to output. Options are: css, sass, less, and stylus
 * @param {Dictionary} options.dictionary - The dictionary object that gets passed to the format method.
 * @param {OutputReferences} [options.outputReferences] - Whether or not to output references
 * @param {Boolean} [options.outputReferenceFallbacks] - Whether or not to output a faLLback value for output references
 * @param {Formatting} [options.formatting] - Custom formatting properties that define parts of a declaration line in code. This will get passed to `formatHelpers` -> `createPropertyformat` and used for the `lineSeparator` between lines of code.
 * @param {Boolean} [options.themeable] [false] - Whether tokens should default to being themeable.
 * @param {boolean} [options.usesDtcg] [false] - Whether DTCG token syntax should be uses.
 * @returns {String}
 * @example
 * ```js
 * StyleDictionary.registerFormat({
 *   name: 'myCustomFormat',
 *   format: function({ dictionary, options }) {
 *     return formattedVariables({
 *       format: 'less',
 *       dictionary,
 *       outputReferences: options.outputReferences
 *     });
 *   }
 * });
 * ```
 */
function customFormattedVariables({
  format,
  dictionary,
  outputReferences = false,
  outputReferenceFallbacks,
  formatting = {},
  themeable = false,
  usesDtcg = false,
}) {
  // typecast, we know that by know the tokens have been transformed
  let allTokens = /** @type {Token[]} */ (dictionary.allTokens);
  /** @type {Tokens} */
  const tokens = dictionary.tokens;

  const { lineSeparator } = Object.assign(
    {},
    {
      lineSeparator: "\n",
    },
    formatting,
  );

  // Some languages are imperative, meaning a variable has to be defined
  // before it is used. If `outputReferences` is true, check if the token
  // has a reference, and if it does send it to the end of the array.
  // We also need to account for nested references, a -> b -> c. They
  // need to be defined in reverse order: c, b, a so that the reference always
  // comes after the definition
  if (outputReferences) {
    // note: using the spread operator here so we get a new array rather than
    // mutating the original
    allTokens = [...allTokens].sort(
      sortByReference(tokens, {
        unfilteredTokens: dictionary.unfilteredTokens,
        usesDtcg,
      }),
    );
  }

  return allTokens
    .map(
      customCreatePropertyFormatter({
        outputReferences,
        outputReferenceFallbacks,
        dictionary,
        format,
        formatting,
        themeable,
        usesDtcg,
      }),
    )
    .filter((strVal) => {
      return !!strVal;
    })
    .join(lineSeparator);
}

/**
 * Copy from style-dictionary@4.1.4: node_modules/style-dictionary/lib/common/formatHelpers/createPropertyFormatter.js
 * Not change.
 *
 * Split a string comment by newlines and
 * convert to multi-line comment if necessary
 * @param {string} to_ret_token
 * @param {string} comment
 * @param {Formatting} options
 * @returns {string}
 */
function customAddComment(to_ret_token, comment, options) {
  const { commentStyle, indentation } = options;
  let { commentPosition } = options;

  const commentsByNewLine = comment.split("\n");
  if (commentsByNewLine.length > 1) {
    commentPosition = "above";
  }

  let processedComment;
  switch (commentStyle) {
    case "short":
      if (commentPosition === "inline") {
        processedComment = `// ${comment}`;
      } else {
        processedComment = commentsByNewLine.reduce(
          (acc, curr) => `${acc}${indentation}// ${curr}\n`,
          "",
        );
        // remove trailing newline
        processedComment = processedComment.replace(/\n$/g, "");
      }
      break;
    case "long":
      if (commentsByNewLine.length > 1) {
        processedComment = commentsByNewLine.reduce(
          (acc, curr) => `${acc}${indentation} * ${curr}\n`,
          `${indentation}/**\n`,
        );
        processedComment += `${indentation} */`;
      } else {
        processedComment = `${commentPosition === "above" ? indentation : ""}/* ${comment} */`;
      }
      break;
  }

  let new_to_ret_token = to_ret_token;

  if (commentPosition === "above") {
    // put the comment above the token if it's multi-line or if commentStyle ended with -above
    new_to_ret_token = `${processedComment}\n${to_ret_token}`;
  } else {
    new_to_ret_token = `${to_ret_token} ${processedComment}`;
  }

  return new_to_ret_token;
}

/**
 * Copy from style-dictionary@4.1.4: node_modules/style-dictionary/lib/common/formatHelpers/createPropertyFormatter.js
 *
 * Creates a function that can be used to format a token. This can be useful
 * to use as the function on `dictionary.allTokens.map`. The formatting
 * is configurable either by supplying a `format` option or a `formatting` object
 * which uses: prefix, indentation, separator, suffix, and commentStyle.
 * @memberof module:formatHelpers
 * @name createPropertyFormatter
 * @example
 * ```javascript
 * StyleDictionary.registerFormat({
 *   name: 'myCustomFormat',
 *   format: function({ dictionary, options }) {
 *     const { outputReferences } = options;
 *     const formatProperty = createPropertyFormatter({
 *       outputReferences,
 *       dictionary,
 *       format: 'css'
 *     });
 *     return dictionary.allTokens.map(formatProperty).join('\n');
 *   }
 * });
 * ```
 * @param {Object} options
 * @param {OutputReferences} [options.outputReferences] - Whether or not to output references. You will want to pass this from the `options` object sent to the format function.
 * @param {boolean} [options.outputReferenceFallbacks] - Whether or not to output css variable fallback values when using output references. You will want to pass this from the `options` object sent to the format function.
 * @param {Dictionary} options.dictionary - The dictionary object sent to the format function
 * @param {string} [options.format] - Available formats are: 'css', 'sass', 'less', and 'stylus'. If you want to customize the format and can't use one of those predefined formats, use the `formatting` option
 * @param {Formatting} [options.formatting] - Custom formatting properties that define parts of a declaration line in code. The configurable strings are: `prefix`, `indentation`, `separator`, `suffix`, `lineSeparator`, `fileHeaderTimestamp`, `header`, `footer`, `commentStyle` and `commentPosition`. Those are used to generate a line like this: `${indentation}${prefix}${token.name}${separator} ${prop.value}${suffix}`. The remaining formatting options are used for the fileHeader helper.
 * @param {boolean} [options.themeable] [false] - Whether tokens should default to being themeable.
 * @param {boolean} [options.usesDtcg] [false] - Whether DTCG token syntax should be uses.
 * @returns {(token: import('../../../types/DesignToken.ts').TransformedToken) => string}
 */
function customCreatePropertyFormatter({
  outputReferences = false,
  outputReferenceFallbacks = false,
  dictionary,
  format,
  formatting = {},
  themeable = false,
  usesDtcg = false,
}) {
  /** @type {Formatting} */
  const formatDefaults = {};
  switch (format) {
    case "css":
      formatDefaults.prefix = "--";
      formatDefaults.indentation = "  ";
      formatDefaults.separator = ":";
      break;
    case "sass":
      formatDefaults.prefix = "$";
      formatDefaults.commentStyle = "short";
      formatDefaults.indentation = "";
      formatDefaults.separator = ":";
      break;
    case "less":
      formatDefaults.prefix = "@";
      formatDefaults.commentStyle = "short";
      formatDefaults.indentation = "";
      formatDefaults.separator = ":";
      break;
    case "stylus":
      formatDefaults.prefix = "$";
      formatDefaults.commentStyle = "short";
      formatDefaults.indentation = "";
      formatDefaults.separator = "=";
      break;
  }
  const mergedOptions = {
    ...{
      prefix: "",
      commentStyle: "long",
      commentPosition: "inline",
      indentation: "",
      separator: " =",
      suffix: ";",
    },
    ...formatDefaults,
    ...formatting,
  };
  const { prefix, commentStyle, indentation, separator, suffix } =
    mergedOptions;
  const { tokens, unfilteredTokens } = dictionary;
  return (token) => {
    let to_ret_token = `${indentation}${prefix}${token.name}${separator} `;
    let value = usesDtcg ? token.$value : token.value;
    const originalValue = usesDtcg
      ? token.original.$value
      : token.original.value;

    const shouldOutputRef =
      usesReferences(originalValue) &&
      (typeof outputReferences === "function"
        ? outputReferences(token, { dictionary, usesDtcg })
        : outputReferences);
    /**
     * A single value can have multiple references either by interpolation:
     * "value": "{size.border.width.value} solid {color.border.primary.value}"
     * or if the value is an object:
     * "value": {
     *    "size": "{size.border.width.value}",
     *    "style": "solid",
     *    "color": "{color.border.primary.value"}
     * }
     * This will see if there are references and if there are, replace
     * the resolved value with the reference's name.
     */
    if (shouldOutputRef) {
      // Formats that use this function expect `value` to be a string
      // or else you will get '[object Object]' in the output
      const refs = getReferences(
        originalValue,
        tokens,
        { unfilteredTokens, warnImmediately: false },
        [],
      );

      // original can either be an object value, which requires transitive value transformation in web CSS formats
      // or a different (primitive) type, meaning it can be stringified.
      const originalIsObject =
        typeof originalValue === "object" && originalValue !== null;

      if (!originalIsObject) {
        // TODO: find a better way to deal with object-value tokens and outputting refs
        // e.g. perhaps it is safer not to output refs when the value is transformed to a non-object
        // for example for CSS-like formats we always flatten to e.g. strings

        // when original is object value, we replace value by matching ref.value and putting a var instead.
        // Due to the original.value being an object, it requires transformation, so undoing the transformation
        // by replacing value with original.value is not possible. (this is the early v3 approach to outputting refs)

        // when original is string value, we replace value by matching original.value and putting a var instead
        // this is more friendly to transitive transforms that transform the string values (v4 way of outputting refs)
        value = originalValue;
      }

      for (const ref of refs) {
        // value should be a string that contains the resolved reference
        // because Style Dictionary resolved this in the resolution step.
        // Here we are undoing that by replacing the value with
        // the reference's name
        if (
          Object.hasOwn(ref, `${usesDtcg ? "$" : ""}value`) &&
          Object.hasOwn(ref, "name")
        ) {
          const refVal = usesDtcg ? ref.$value : ref.value;
          const replaceFunc = () => {
            if (format === "css") {
              if (outputReferenceFallbacks) {
                return `var(${prefix}${ref.name}, ${refVal})`;
              }
              return `var(${prefix}${ref.name})`;
            }
            return `${prefix}${ref.name}`;
          };
          // TODO: add test
          // technically speaking a reference can be made to a number or boolean token, in this case we stringify it first
          value = `${value}`.replace(
            originalIsObject
              ? refVal
              : new RegExp(`{${ref.path.join("\\.")}(\\.\\$?value)?}`, "g"),
            replaceFunc,
          );
        }
      }
    }

    to_ret_token += value;

    const themeable_token =
      typeof token.themeable === "boolean" ? token.themeable : themeable;
    if (format === "sass" && themeable_token) {
      to_ret_token += " !default";
    }

    to_ret_token += suffix;

    const comment = token.$description ?? token.comment;
    if (comment && commentStyle !== "none") {
      to_ret_token = customAddComment(to_ret_token, comment, mergedOptions);
    }

    return to_ret_token;
  };
}
