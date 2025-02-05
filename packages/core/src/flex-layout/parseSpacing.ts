export function parseSpacing(value: number | string | undefined) {
  if (value === undefined || typeof value === "string") {
    return value;
  }

  return `calc(var(--salt-spacing-100) * ${value})`;
}
