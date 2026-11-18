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
    import("./cssFoundations-salt-interim.json"),
    import("./cssCharacteristics-salt-interim.json"),
  ]).then(
    ([
      nextFoundations,
      legacyFoundations,
      nextCharacteristics,
      legacyCharacteristics,
      interimFoundations,
      interimCharacteristics,
    ]) => ({
      next: {
        characteristics: nextCharacteristics.default as CssVariableData,
        foundations: nextFoundations.default as CssVariableData,
      },
      legacy: {
        characteristics: legacyCharacteristics.default as CssVariableData,
        foundations: legacyFoundations.default as CssVariableData,
      },
      "salt-interim": {
        characteristics: interimCharacteristics.default as CssVariableData,
        foundations: interimFoundations.default as CssVariableData,
      },
    }),
  );

  return themeTokenTablesPromise;
}

const defaultTheme: ThemeType = "next";
const defaultMode: Mode = "system";

export const TokenTableWithControls = ({
  tokens,
  contextLabel,
}: {
  tokens: string[];
  /**
   * Names the section the table belongs to, usually its heading.
   */
  contextLabel?: string;
}) => {
  const [theme, setTheme] = useState<ThemeType>(defaultTheme);
  const [mode, setMode] = useState<Mode>(defaultMode);
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
        contextLabel,
        onModeChange: setMode,
        onThemeChange: setTheme,
        onReset: () => {
          setTheme(defaultTheme);
          setMode(defaultMode);
        },
      }}
      showGroupDescriptions={false}
      showGroupHeadings={false}
    />
  );
};
