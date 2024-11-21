// Regexps involved with splitting words in various case formats.
const SPLIT_LOWER_UPPER_RE = /([\p{Ll}\d])(\p{Lu})/gu; // ( lower case + digit ) ( upper case )
const SPLIT_LOWER_NON_DIGIT_UPPER_RE = /([\p{Ll}])(\p{Lu})/gu; // ( lower case  ) ( upper case )
const SPLIT_UPPER_UPPER_RE = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu; // ( upper case ) ( [ upper case ] [ lower case ] )
// The replacement value for splits.
const SPLIT_REPLACE_VALUE = "$1\0$2";

// Regexp involved with stripping non-word characters from the result.
const DEFAULT_STRIP_REGEXP = /[^\p{L}\d]+/giu;

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

/**
 * Modified version of kebabCase from 'change-case', where '40A' will be '40a' instead of '40-a'
 * @param {string} input
 * @returns
 */
function specialKebab(input) {
  const [prefix, words, suffix] = splitPrefixSuffix(input);
  return prefix + words.map((input) => input.toLowerCase()).join("-") + suffix;
}

/**
 *
 * @param {string} value
 * @returns
 */
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

/**
 *
 * @param {string} name
 */
function removeDefaultSuffix(name) {
  return name.replace(/-default$/, "");
}

const saltKebab = (token, config) => {
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

    const name = removeDefaultSuffix(
      specialKebab([config.prefix].concat(alphaRemovedPath).join(" ")),
    );
    console.log("salt-ds/name/kebab specialKebab name", name, token);
    return name;
  }
  const name = removeDefaultSuffix(
    specialKebab([config.prefix].concat(token.path).join(" ")),
  );
  console.log("salt-ds/name/kebab name", name, token);
  return name;
};
export const saltNameKebab = {
  name: "salt-ds/name/kebab",
  type: "name",
  transitive: true,
  transform: saltKebab,
};
