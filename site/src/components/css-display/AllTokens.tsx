import {
  capitalize,
  FlowLayout,
  H2,
  H3,
  Input,
  Spinner,
  StackLayout,
  Switch,
  Table,
  TBody,
  TD,
  Text,
  TH,
  THead,
  ToggleButton,
  ToggleButtonGroup,
  TR,
} from "@salt-ds/core";
import { useEffect, useState } from "react";
import { Callout } from "../callout";
import { CopyToClipboard } from "../copy-to-clipboard";
import styles from "./AllTokens.module.css";
import { TokenPreview } from "./TokenPreview";
import {
  filterFoundationTokens,
  groupTokens,
  type TokenGroups,
} from "./tokenData";

type CssVariableData = Record<string, string>;
type Density = "high" | "medium" | "low" | "touch" | "mobile";
type DensityOverrides = Partial<
  Record<string, Partial<Record<Density, string>>>
>;
type ThemeType = "next" | "legacy";
type Mode = "light" | "dark";
type TokenTier = "characteristic" | "foundation";
type TokenTableData = {
  characteristics: TokenGroups | null;
  foundations: TokenGroups | null;
  characteristicDensity: DensityOverrides | null;
  foundationDensity: DensityOverrides | null;
};

function getSectionHeadingId(tier: TokenTier) {
  return `${tier}-tokens`;
}

function getGroupHeadingId(tier: TokenTier, group: string) {
  return `${tier}-${group}`.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}
type ThemeTokenTables = Record<ThemeType, TokenTableData>;

export function AllTokens() {
  const [theme, setTheme] = useState<ThemeType>("next");
  const [density, setDensity] = useState<Density>("medium");
  const [mode, setMode] = useState<Mode>("light");
  const [filterText, setFilterText] = useState("");
  const [themeTables, setThemeTables] = useState<ThemeTokenTables | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [
        nextFoundations,
        legacyFoundations,
        nextCharacteristics,
        legacyCharacteristics,
        nextFoundationDensity,
        legacyFoundationDensity,
        nextCharacteristicDensity,
        legacyCharacteristicDensity,
      ] = await Promise.all([
        import("./cssFoundations-next.json"),
        import("./cssFoundations-legacy.json"),
        import("./cssCharacteristics-next.json"),
        import("./cssCharacteristics-legacy.json"),
        import("./cssFoundationsDensity-next.json"),
        import("./cssFoundationsDensity-legacy.json"),
        import("./cssCharacteristicsDensity-next.json"),
        import("./cssCharacteristicsDensity-legacy.json"),
      ]);

      if (!active) {
        return;
      }

      setThemeTables({
        next: {
          characteristics: groupTokens(
            nextCharacteristics.default as CssVariableData,
          ),
          foundations: groupTokens(
            filterFoundationTokens(nextFoundations.default as CssVariableData),
          ),
          characteristicDensity:
            nextCharacteristicDensity.default as DensityOverrides,
          foundationDensity: nextFoundationDensity.default as DensityOverrides,
        },
        legacy: {
          characteristics: groupTokens(
            legacyCharacteristics.default as CssVariableData,
          ),
          foundations: groupTokens(
            filterFoundationTokens(
              legacyFoundations.default as CssVariableData,
            ),
          ),
          characteristicDensity:
            legacyCharacteristicDensity.default as DensityOverrides,
          foundationDensity:
            legacyFoundationDensity.default as DensityOverrides,
        },
      });
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const tables = themeTables?.[theme] ?? {
    characteristics: null,
    foundations: null,
    characteristicDensity: null,
    foundationDensity: null,
  };

  const hasCharacteristicResults =
    tables.characteristics !== null &&
    Object.keys(filterTokenGroups(tables.characteristics, filterText)).length >
      0;
  const hasFoundationResults =
    tables.foundations !== null &&
    Object.keys(filterTokenGroups(tables.foundations, filterText)).length > 0;
  const showEmptyState =
    filterText.trim() !== "" &&
    tables.characteristics !== null &&
    tables.foundations !== null &&
    !hasCharacteristicResults &&
    !hasFoundationResults;

  return (
    <StackLayout gap={2} className={styles.container}>
      <FlowLayout className={styles.controls} align="center">
        <Text>
          <strong>Theme</strong>
        </Text>
        <ToggleButtonGroup
          aria-label="Select token theme"
          value={theme}
          onChange={(event) => setTheme(event.currentTarget.value as ThemeType)}
        >
          <ToggleButton value="next">JPM Brand</ToggleButton>
          <ToggleButton value="legacy">Legacy</ToggleButton>
        </ToggleButtonGroup>
        <Text>
          <strong>Density</strong>
        </Text>
        <ToggleButtonGroup
          aria-label="Select token density"
          value={density}
          onChange={(event) => setDensity(event.currentTarget.value as Density)}
        >
          <ToggleButton value="high">High</ToggleButton>
          <ToggleButton value="medium">Medium</ToggleButton>
          <ToggleButton value="low">Low</ToggleButton>
          <ToggleButton value="touch">Touch</ToggleButton>
          <ToggleButton value="mobile">Mobile</ToggleButton>
        </ToggleButtonGroup>
        <Text>
          <strong>Dark mode</strong>
        </Text>
        <Switch
          checked={mode === "dark"}
          onChange={(event) =>
            setMode(event.currentTarget.checked ? "dark" : "light")
          }
        />
      </FlowLayout>
      <Input
        aria-label="Filter tokens"
        className={styles.filterInput}
        placeholder="Filter tokens"
        value={filterText}
        inputProps={{
          onChange: (event) => setFilterText(event.target.value),
        }}
      />
      {showEmptyState ? (
        <Callout title="No matching tokens" status="info">
          No tokens match &quot;{filterText.trim()}&quot;. Try a different token
          name or prefix.
        </Callout>
      ) : null}

      <TokenTable
        title="Characteristic tokens"
        tier="characteristic"
        groupedRows={tables.characteristics}
        densityOverrides={tables.characteristicDensity}
        filterText={filterText}
        loadingLabel="Loading characteristic tokens"
        density={density}
        mode={mode}
        theme={theme}
      />
      <TokenTable
        title="Foundation tokens"
        tier="foundation"
        groupedRows={tables.foundations}
        densityOverrides={tables.foundationDensity}
        filterText={filterText}
        loadingLabel="Loading foundation tokens"
        density={density}
        mode={mode}
        theme={theme}
      />
    </StackLayout>
  );
}

function TokenTable({
  title,
  tier,
  groupedRows,
  densityOverrides,
  filterText,
  loadingLabel,
  density,
  mode,
  theme,
}: {
  title: string;
  tier: TokenTier;
  groupedRows: TokenGroups | null;
  densityOverrides: DensityOverrides | null;
  filterText: string;
  loadingLabel: string;
  density: Density;
  mode: Mode;
  theme: ThemeType;
}) {
  if (groupedRows === null) {
    return (
      <Spinner
        className={styles.loading}
        role="status"
        aria-label={loadingLabel}
        size="large"
      />
    );
  }

  const filteredRows = filterTokenGroups(groupedRows, filterText);
  const themeKey = `${tier}-${theme}-${mode}`;
  const visibleGroups = Object.entries(filteredRows);

  if (visibleGroups.length === 0) {
    return null;
  }

  return (
    <StackLayout gap={1}>
      <H2 id={getSectionHeadingId(tier)} data-mdx="heading2">
        {capitalize(title)}
      </H2>
      {visibleGroups.map(([group, rows]) => (
        <StackLayout key={group} gap={0.5}>
          <H3 id={getGroupHeadingId(tier, group)} data-mdx="heading3">
            {capitalize(group)}
          </H3>
          <div className={styles.tableWrap}>
            <Table zebra>
              <THead>
                <TR>
                  <TH>Value</TH>
                  <TH>Token</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map(([name, value]) => {
                  const resolvedValue =
                    densityOverrides?.[name]?.[density] ?? value;

                  return (
                    <TR key={name}>
                      <TD>
                        <TokenPreview
                          name={name}
                          value={resolvedValue}
                          mode={mode}
                          themeKey={themeKey}
                          theme={theme}
                        />
                      </TD>
                      <TD className={styles.tokenCell}>
                        <div className={styles.tokenRow}>
                          <Text styleAs="code">{name}</Text>
                          <CopyToClipboard value={name} />
                        </div>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </div>
        </StackLayout>
      ))}
    </StackLayout>
  );
}

function filterTokenGroups(groupedRows: TokenGroups, filterText: string) {
  const normalizedFilter = filterText.trim().toLowerCase();

  if (normalizedFilter === "") {
    return groupedRows;
  }

  return Object.fromEntries(
    Object.entries(groupedRows)
      .map(([group, rows]) => [
        group,
        rows.filter(([name]) => name.toLowerCase().includes(normalizedFilter)),
      ])
      .filter(([, rows]) => rows.length > 0),
  ) as TokenGroups;
}
