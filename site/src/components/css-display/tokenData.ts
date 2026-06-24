type CssVariableData = Record<string, string>;
export type TokenGroups = Record<string, Array<[string, string]>>;

export function groupTokens(data: CssVariableData): TokenGroups {
  return Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce<TokenGroups>((acc, [name, value]) => {
      const group = getTokenGroup(name);
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push([name, value]);
      return acc;
    }, {});
}

export function filterFoundationTokens(data: CssVariableData): CssVariableData {
  return Object.fromEntries(
    Object.entries(data).filter(([name]) => !isFoundationColorToken(name)),
  );
}

function isFoundationColorToken(name: string) {
  return name.startsWith("--salt-color-");
}

function getTokenGroup(name: string): string {
  const match = /^--salt-([a-zA-Z0-9]+)-/.exec(name);
  return match?.[1] ?? "other";
}
