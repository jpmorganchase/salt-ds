import { useEffect, useMemo, useState } from "react";
import { type Mode, type ThemeType, TokenTable } from "./TokenTable";
import type { TokenGroups } from "./tokenData";

type CssVariableData = Record<string, string>;
type ThemeTokenData = {
  characteristics: CssVariableData;
  foundations: CssVariableData;
};
type ThemeTokenTables = Record<ThemeType, ThemeTokenData>;

let themeTokenTablesPromise: Promise<ThemeTokenTables> | null = null;

function loadThemeTokenTables() {
  themeTokenTablesPromise ??= Promise.all([
    import("./cssFoundations-next.json"),
    import("./cssFoundations-legacy.json"),
    import("./cssCharacteristics-next.json"),
    import("./cssCharacteristics-legacy.json"),
  ]).then(
    ([
      nextFoundations,
      legacyFoundations,
      nextCharacteristics,
      legacyCharacteristics,
    ]) => ({
      next: {
        characteristics: nextCharacteristics.default as CssVariableData,
        foundations: nextFoundations.default as CssVariableData,
      },
      legacy: {
        characteristics: legacyCharacteristics.default as CssVariableData,
        foundations: legacyFoundations.default as CssVariableData,
      },
    }),
  );

  return themeTokenTablesPromise;
}

export const TokenTableWithControls = ({ tokens }: { tokens: string[] }) => {
  const [theme, setTheme] = useState<ThemeType>("next");
  const [mode, setMode] = useState<Mode>("system");
  const [themeTables, setThemeTables] = useState<ThemeTokenTables | null>(null);

  useEffect(() => {
    let active = true;

    loadThemeTokenTables().then((tables) => {
      if (!active) {
        return;
      }

      setThemeTables(tables);
    });

    return () => {
      active = false;
    };
  }, []);

  const selectedTable = themeTables?.[theme] ?? null;
  const groupedRows = useMemo<TokenGroups | null>(() => {
    if (!selectedTable) {
      return null;
    }

    return {
      tokens: tokens.flatMap((name) => {
        const value =
          selectedTable.characteristics[name] ??
          selectedTable.foundations[name];

        if (value === undefined) {
          console.error(`Token "${name}" not found in the token data.`);
          return [];
        }

        return [[name, value] as [string, string]];
      }),
    };
  }, [selectedTable, tokens]);

  return (
    <TokenTable
      tier="characteristic"
      groupedRows={groupedRows}
      loadingLabel="Loading tokens"
      mode={mode}
      theme={theme}
      controls={{
        onModeChange: setMode,
        onThemeChange: setTheme,
      }}
      showGroupDescriptions={false}
      showGroupHeadings={false}
    />
  );
};
