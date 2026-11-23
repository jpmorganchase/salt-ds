// Shared by PropsTable and the docs generated for coding agents
// (tooling/agent-docs), so both show the same types.

const MAX_ENUM_VALUES = 12;

/**
 * A prop's type as the props tables show it. react-docgen-typescript names
 * literal unions "enum", so their values are listed instead, unless there are
 * too many to read.
 *
 * @param {{ name?: string, raw?: string, value?: unknown } | undefined} type
 * @returns {string}
 */
export function formatPropType(type) {
  if (type?.name !== "enum") return type?.name ?? "";
  if (
    Array.isArray(type.value) &&
    type.value.length > 0 &&
    type.value.length <= MAX_ENUM_VALUES
  ) {
    return type.value.map((item) => String(item?.value)).join(" | ");
  }
  return type.raw ?? type.name;
}
