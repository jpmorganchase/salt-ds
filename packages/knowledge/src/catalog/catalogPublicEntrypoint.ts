import {
  PORTABLE_REPOSITORY_PATH_PATTERN,
  WINDOWS_RESERVED_DEVICE_BASENAME_PATTERN_SOURCE,
} from "./catalogPortablePath.js";

const PORTABLE_SUFFIX_PATTERN_SOURCE =
  PORTABLE_REPOSITORY_PATH_PATTERN.source.slice(1, -1);

export const PUBLIC_PACKAGE_ENTRYPOINT_PATTERN = new RegExp(
  `^(?:\\.|\\./(?!(?:${WINDOWS_RESERVED_DEVICE_BASENAME_PATTERN_SOURCE})(?:\\.[^/]*)?(?:/|$))(?:${PORTABLE_SUFFIX_PATTERN_SOURCE}))$`,
  "u",
);

export function isPublicPackageEntrypoint(value: string): boolean {
  return PUBLIC_PACKAGE_ENTRYPOINT_PATTERN.test(value);
}
