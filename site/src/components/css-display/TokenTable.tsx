import { useColorMode } from "@jpmorganchase/mosaic-store";
import {
  Button,
  capitalize,
  H2,
  H3,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
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
  Tooltip,
  TR,
} from "@salt-ds/core";
import { ChevronDownIcon, SettingsIcon } from "@salt-ds/icons";
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
export type ThemeType = "next" | "legacy";
export type TokenTier = "characteristic" | "foundation";

export const themes: Array<{ displayName: string; value: ThemeType }> = [
  {
    displayName: "JPM Brand",
    value: "next",
  },
  {
    displayName: "Legacy",
    value: "legacy",
  },
];

export const densities: Density[] = [
  "high",
  "medium",
  "low",
  "touch",
  "mobile",
];

export function getThemeDisplayName(value: ThemeType) {
  return themes.find((theme) => theme.value === value)?.displayName ?? value;
}

type TokenTableControls = {
  onDensityChange?: (density: Density) => void;
  onModeChange: (mode: Mode) => void;
  onThemeChange: (theme: ThemeType) => void;
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
    <StackLayout gap={1}>
      {title ? (
        <H2 id={getSectionHeadingId(tier)} data-mdx="heading2">
          {capitalize(title)}
        </H2>
      ) : null}
      {visibleGroups.map(([group, rows]) => (
        <StackLayout key={group} gap={0.5}>
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
    <Overlay>
      <Tooltip aria-hidden="true" content="Token table controls">
        <OverlayTrigger>
          <Button
            aria-label="Token table controls"
            appearance="bordered"
            sentiment="neutral"
          >
            <SettingsIcon aria-hidden />
            <ChevronDownIcon aria-hidden />
          </Button>
        </OverlayTrigger>
      </Tooltip>
      <OverlayPanel className={styles.compactControlsOverlay}>
        <OverlayPanelContent className={styles.compactControlsOverlayContent}>
          <StackLayout gap={1} padding={{ md: 1 }}>
            {controls.onDensityChange ? (
              <StackLayout gap={0.75} align="baseline" padding={0}>
                <Text styleAs="label" color="secondary">
                  <strong>Density</strong>
                </Text>
                <ToggleButtonGroup
                  className={styles.compactToggleGroup}
                  aria-label="Select density"
                  value={density}
                  onChange={(event) =>
                    controls.onDensityChange?.(
                      event.currentTarget.value as Density,
                    )
                  }
                >
                  {densities.map((value) => (
                    <ToggleButton key={value} value={value}>
                      {capitalize(value)}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </StackLayout>
            ) : null}
            <StackLayout gap={0.75} align="baseline" padding={0}>
              <Text styleAs="label" color="secondary">
                <strong>Mode</strong>
              </Text>
              <ToggleButtonGroup
                className={styles.compactToggleGroup}
                aria-label="Select mode"
                value={mode}
                onChange={(event) =>
                  controls.onModeChange(event.currentTarget.value as Mode)
                }
              >
                <ToggleButton value="system">System</ToggleButton>
                <ToggleButton value="light">Light</ToggleButton>
                <ToggleButton value="dark">Dark</ToggleButton>
              </ToggleButtonGroup>
            </StackLayout>
            <StackLayout gap={0.75} align="baseline" padding={0}>
              <Text styleAs="label" color="secondary">
                <strong>Themes</strong>
              </Text>
              <ToggleButtonGroup
                className={styles.compactToggleGroup}
                aria-label="Select theme"
                value={theme}
                onChange={(event) =>
                  controls.onThemeChange(event.currentTarget.value as ThemeType)
                }
              >
                <ToggleButton value="legacy">Legacy</ToggleButton>
                <ToggleButton value="next">JPM Brand</ToggleButton>
              </ToggleButtonGroup>
            </StackLayout>
          </StackLayout>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
}

function getSectionHeadingId(tier: TokenTier) {
  return `${tier}-tokens`;
}

function getGroupHeadingId(tier: TokenTier, group: string) {
  return `${tier}-${group}`.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}
