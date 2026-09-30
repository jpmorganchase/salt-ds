import { useColorMode } from "@jpmorganchase/mosaic-store";
import {
  capitalize,
  H2,
  H3,
  Spinner,
  StackLayout,
  Table,
  TBody,
  TD,
  Text,
  TH,
  THead,
  TR,
} from "@salt-ds/core";
import { ThemeSettingsOverlay } from "../components/ThemeSettingsOverlay";
import { CopyToClipboard } from "../copy-to-clipboard";
import styles from "./AllTokens.module.css";
import { getTokenGroupDescription } from "./descriptions";
import { TokenPreview } from "./TokenPreview";
import type { TokenGroups } from "./tokenData";

export type Density = "high" | "medium" | "low" | "touch" | "mobile";
export type DensityOverrides = Partial<
  Record<string, Partial<Record<Density, string>>>
>;
export type Mode = "light" | "dark" | "system";
export type ThemeType = "next" | "legacy" | "salt-interim";
export type TokenTier = "characteristic" | "foundation";

export const themes: Array<{ displayName: string; value: ThemeType }> = [
  {
    displayName: "J.P. Morgan",
    value: "next",
  },
  {
    displayName: "Legacy",
    value: "legacy",
  },
  {
    displayName: "J.P. Morgan (Interim)",
    value: "salt-interim",
  },
];

export const densities: Density[] = [
  "high",
  "medium",
  "low",
  "touch",
  "mobile",
];

const themeOptions = themes.map(({ displayName, value }) => ({
  value,
  label: displayName,
}));

export function getThemeDisplayName(value: ThemeType) {
  return themes.find((theme) => theme.value === value)?.displayName ?? value;
}

type TokenTableControls = {
  /**
   * Names the section the table belongs to, to distinguish its settings
   * trigger from others on the page.
   */
  contextLabel?: string;
  onDensityChange?: (density: Density) => void;
  onModeChange: (mode: Mode) => void;
  onThemeChange: (theme: ThemeType) => void;
  onReset: () => void;
};

type TokenTableProps = {
  title?: string;
  tier: TokenTier;
  groupedRows: TokenGroups | null;
  loadingLabel: string;
  density?: Density;
  densityOverrides?: DensityOverrides;
  mode: Mode;
  theme: ThemeType;
  controls?: TokenTableControls;
  showGroupDescriptions?: boolean;
  showGroupHeadings?: boolean;
};

export function TokenTable({
  title,
  tier,
  groupedRows,
  densityOverrides,
  loadingLabel,
  density = "medium",
  mode,
  theme,
  controls,
  showGroupDescriptions = true,
  showGroupHeadings = true,
}: TokenTableProps) {
  const siteMode = useColorMode();

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

  const themeKey = `${theme}-${mode}`;
  const visibleGroups = Object.entries(groupedRows).filter(
    ([, rows]) => rows.length > 0,
  );

  if (visibleGroups.length === 0) {
    return null;
  }

  const previewMode = mode === "system" ? siteMode : mode;
  return (
    <StackLayout gap={2}>
      {title ? (
        <H2 id={getSectionHeadingId(tier)} data-mdx="heading2">
          {capitalize(title)}
        </H2>
      ) : null}
      {visibleGroups.map(([group, rows]) => (
        <StackLayout key={group} gap={1}>
          {showGroupHeadings ? (
            <>
              <H3 id={getGroupHeadingId(tier, group)} data-mdx="heading3">
                {capitalize(group)}
              </H3>
              {showGroupDescriptions ? (
                <Text>{getTokenGroupDescription(tier, group)}</Text>
              ) : null}
            </>
          ) : null}
          <div className={styles.tableWrap}>
            <Table zebra divider="none">
              <THead>
                <TR>
                  <TH className={styles.valueHeaderCell}>
                    <div className={styles.valueHeaderRow}>Value</div>
                  </TH>
                  <TH className={styles.tokenHeaderCell}>
                    <div className={styles.tokenHeaderRow}>
                      <span>Token</span>
                      {controls ? (
                        <TokenTableSettings
                          controls={controls}
                          density={density}
                          mode={mode}
                          theme={theme}
                        />
                      ) : null}
                    </div>
                  </TH>
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
                          density={density}
                          mode={previewMode}
                          themeKey={`${themeKey}-${previewMode}`}
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

function TokenTableSettings({
  controls,
  density,
  mode,
  theme,
}: {
  controls: TokenTableControls;
  density: Density;
  mode: Mode;
  theme: ThemeType;
}) {
  return (
    <ThemeSettingsOverlay<ThemeType>
      scope="tokens"
      contextLabel={controls.contextLabel}
      density={density}
      onDensityChange={controls.onDensityChange}
      mode={mode}
      onModeChange={controls.onModeChange}
      theme={theme}
      themeOptions={themeOptions}
      onThemeChange={controls.onThemeChange}
      onReset={controls.onReset}
    />
  );
}

function getSectionHeadingId(tier: TokenTier) {
  return `${tier}-tokens`;
}

function getGroupHeadingId(tier: TokenTier, group: string) {
  return `${tier}-${group}`.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}
