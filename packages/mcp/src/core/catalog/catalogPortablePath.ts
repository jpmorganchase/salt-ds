export const WINDOWS_RESERVED_DEVICE_BASENAME_PATTERN_SOURCE =
  "(?:[cC][oO][nN]|[pP][rR][nN]|[aA][uU][xX]|[nN][uU][lL]|[cC][oO][mM][1-9¹²³]|[lL][pP][tT][1-9¹²³])";
const WINDOWS_RESERVED_DEVICE_NAME = new RegExp(
  `^${WINDOWS_RESERVED_DEVICE_BASENAME_PATTERN_SOURCE}(?:\\..*)?$`,
  "u",
);
const WINDOWS_INVALID_SEGMENT_CHARACTERS = /[<>:"|?*]/u;

export const PORTABLE_REPOSITORY_PATH_PATTERN =
  // biome-ignore lint/suspicious/noControlCharactersInRegex: the exported schema pattern must reject the ASCII control range.
  /^(?!\s)(?!.*\s$)(?!\/)(?![A-Za-z]:)(?!.*\\)(?!.*\/\/)(?!.*\/$)(?!.*(?:^|\/)\.\.?(?:$|\/))(?!.*[<>:"|?*])(?!.*[\u0000-\u001F])(?!.*[ .](?:\/|$))(?!.*(?:^|\/)(?:[cC][oO][nN]|[pP][rR][nN]|[aA][uU][xX]|[nN][uU][lL]|[cC][oO][mM][1-9¹²³]|[lL][pP][tT][1-9¹²³])(?:\.[^/]*)?(?:\/|$)).+$/u;

function hasWindowsControlCharacter(segment: string): boolean {
  return [...segment].some((character) => character.charCodeAt(0) <= 0x1f);
}

function isPortablePathSegment(segment: string): boolean {
  return (
    segment.length > 0 &&
    segment !== "." &&
    segment !== ".." &&
    segment.normalize("NFC") === segment &&
    !WINDOWS_INVALID_SEGMENT_CHARACTERS.test(segment) &&
    !hasWindowsControlCharacter(segment) &&
    !/[ .]$/u.test(segment) &&
    !WINDOWS_RESERVED_DEVICE_NAME.test(segment)
  );
}

export function isPortableRepositoryPath(value: string): boolean {
  return (
    PORTABLE_REPOSITORY_PATH_PATTERN.test(value) &&
    value === value.trim() &&
    value.normalize("NFC") === value &&
    !value.includes("\\") &&
    !value.startsWith("/") &&
    !/^[A-Za-z]:/u.test(value) &&
    value.split("/").every(isPortablePathSegment)
  );
}
