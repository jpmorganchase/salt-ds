import {
  Button,
  capitalize,
  Dropdown,
  type DropdownProps,
  FormField,
  FormFieldLabel,
  H2,
  H3,
  Input,
  Option,
  Spinner,
  StackLayout,
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
import { CloseIcon, SearchIcon } from "@salt-ds/icons";
import { useEffect, useState } from "react";
import { Callout } from "../callout";
import { CopyToClipboard } from "../copy-to-clipboard";
import styles from "./AllTokens.module.css";
import { getTokenGroupDescription } from "./descriptions";
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
type ThemeTokenTables = Record<ThemeType, TokenTableData>;

function getSectionHeadingId(tier: TokenTier) {
  return `${tier}-tokens`;
}

function getGroupHeadingId(tier: TokenTier, group: string) {
  return `${tier}-${group}`.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}

const emptyTables: TokenTableData = {
  characteristics: null,
  foundations: null,
  characteristicDensity: null,
  foundationDensity: null,
};

const themes: Array<{ displayName: string; value: ThemeType }> = [
  {
    displayName: "JPM Brand",
    value: "next",
  },
  {
    displayName: "Legacy",
    value: "legacy",
  },
];

const densities: Density[] = ["high", "medium", "low", "touch", "mobile"];

function getThemeDisplayName(value: ThemeType) {
  return themes.find((theme) => theme.value === value)?.displayName ?? value;
}

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

  const tables = themeTables?.[theme] ?? emptyTables;

  const filteredCharacteristics =
    tables.characteristics === null
      ? null
      : filterTokenGroups(tables.characteristics, filterText);
  const filteredFoundations =
    tables.foundations === null
      ? null
      : filterTokenGroups(tables.foundations, filterText);

  const hasCharacteristicResults =
    filteredCharacteristics !== null &&
    Object.keys(filteredCharacteristics).length > 0;
  const hasFoundationResults =
    filteredFoundations !== null && Object.keys(filteredFoundations).length > 0;
  const showEmptyState =
    filterText.trim() !== "" &&
    filteredCharacteristics !== null &&
    filteredFoundations !== null &&
    !hasCharacteristicResults &&
    !hasFoundationResults;

  const handleThemeSelectionChange: DropdownProps<ThemeType>["onSelectionChange"] =
    (_event, value) => {
      const [selectedTheme] = value;

      if (selectedTheme) {
        setTheme(selectedTheme);
      }
    };

  const handleDensitySelectionChange: DropdownProps<Density>["onSelectionChange"] =
    (_event, value) => {
      const [selectedDensity] = value;

      if (selectedDensity) {
        setDensity(selectedDensity);
      }
    };

  return (
    <StackLayout gap={2}>
      <div className={styles.controls}>
        <FormField className={styles.controlField}>
          <FormFieldLabel>Theme</FormFieldLabel>
          <Dropdown
            bordered
            className={styles.controlDropdown}
            selected={[theme]}
            onSelectionChange={handleThemeSelectionChange}
            valueToString={getThemeDisplayName}
          >
            {themes.map(({ value }) => (
              <Option key={value} value={value} />
            ))}
          </Dropdown>
        </FormField>
        <FormField className={styles.controlField}>
          <FormFieldLabel>Density</FormFieldLabel>
          <Dropdown
            bordered
            className={styles.controlDropdown}
            selected={[density]}
            onSelectionChange={handleDensitySelectionChange}
            valueToString={(value) => capitalize(value)}
          >
            {densities.map((value) => (
              <Option key={value} value={value} />
            ))}
          </Dropdown>
        </FormField>
        <ToggleButtonGroup
          className={styles.modeToggle}
          aria-label="Mode"
          value={mode}
          onChange={(event) => setMode(event.currentTarget.value as Mode)}
        >
          <ToggleButton value="light">Light</ToggleButton>
          <ToggleButton value="dark">Dark</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <FormField>
        <FormFieldLabel>Search tokens</FormFieldLabel>
        <Input
          bordered
          startAdornment={<SearchIcon aria-hidden />}
          endAdornment={
            filterText ? (
              <Button
                appearance="transparent"
                aria-label="Clear search value"
                onClick={() => setFilterText("")}
              >
                <CloseIcon aria-hidden />
              </Button>
            ) : null
          }
          className={styles.filterInput}
          value={filterText}
          inputProps={{
            onChange: (event) => setFilterText(event.target.value),
          }}
        />
      </FormField>
      {showEmptyState ? (
        <Callout title="No matching tokens" status="info">
          No tokens match &quot;{filterText.trim()}&quot;. Try a different token
          name or prefix.
        </Callout>
      ) : null}

      <TokenTable
        title="Characteristic tokens"
        tier="characteristic"
        groupedRows={filteredCharacteristics}
        densityOverrides={tables.characteristicDensity}
        loadingLabel="Loading characteristic tokens"
        density={density}
        mode={mode}
        theme={theme}
      />
      <TokenTable
        title="Foundation tokens"
        tier="foundation"
        groupedRows={filteredFoundations}
        densityOverrides={tables.foundationDensity}
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
  loadingLabel,
  density,
  mode,
  theme,
}: {
  title: string;
  tier: TokenTier;
  groupedRows: TokenGroups | null;
  densityOverrides: DensityOverrides | null;
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

  const themeKey = `${tier}-${theme}-${mode}`;
  const visibleGroups = Object.entries(groupedRows);

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
          <Text>{getTokenGroupDescription(tier, group)}</Text>
          <div className={styles.tableWrap}>
            <Table zebra divider="none">
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
