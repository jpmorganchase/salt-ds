import {
  Button,
  capitalize,
  type Density,
  Dropdown,
  type Mode,
  Option,
  Overlay,
  OverlayFooter,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  useId,
} from "@salt-ds/core";
import {
  ChevronDownIcon,
  CloseIcon,
  RefreshIcon,
  SettingsIcon,
} from "@salt-ds/icons";
import { useState } from "react";
import styles from "./ThemeSettingsOverlay.module.css";

export type PreviewMode = Mode | "system";
export type ThemeSettingsScope = "component" | "pattern" | "tokens";
export type ThemeOption<T extends string> = { value: T; label: string };

const title = "Preview settings";

const descriptions: Record<ThemeSettingsScope, string> = {
  component:
    "Adjust the theme settings for the component examples on this page",
  pattern: "Adjust the theme settings for the pattern examples on this page",
  tokens: "Adjust the theme settings for the token previews in this table",
};

const densityOptions: Density[] = ["high", "medium", "low", "touch", "mobile"];

export function getDensityDisplayName(density: Density) {
  const label = capitalize(density);
  return density === "touch" ? `${label} (Deprecated)` : label;
}

export interface ThemeSettingsOverlayProps<T extends string> {
  /**
   * Determines the description, which explains what the settings affect.
   */
  scope: ThemeSettingsScope;
  /**
   * Distinguishes the trigger's accessible name when several appear on a page,
   * e.g. the heading of the section the settings belong to.
   */
  contextLabel?: string;
  density?: Density;
  /**
   * The density control is only shown when this is provided.
   */
  onDensityChange?: (density: Density) => void;
  mode?: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
  theme?: T;
  themeOptions: ReadonlyArray<ThemeOption<T>>;
  onThemeChange: (theme: T) => void;
  onReset: () => void;
}

export function ThemeSettingsOverlay<T extends string>({
  scope,
  contextLabel,
  density,
  onDensityChange,
  mode,
  onModeChange,
  theme,
  themeOptions,
  onThemeChange,
  onReset,
}: ThemeSettingsOverlayProps<T>) {
  const [open, setOpen] = useState(false);
  const densityLabelId = useId();
  const modeLabelId = useId();
  const themeLabelId = useId();

  const getThemeLabel = (value: T) =>
    themeOptions.find((option) => option.value === value)?.label ?? value;

  return (
    <Overlay hideArrow placement="bottom" open={open} onOpenChange={setOpen}>
      <Tooltip aria-hidden="true" content={title}>
        <OverlayTrigger>
          <Button
            aria-label={contextLabel ? `${title}, ${contextLabel}` : title}
            sentiment="neutral"
            appearance="bordered"
          >
            <SettingsIcon aria-hidden />
            <ChevronDownIcon aria-hidden />
          </Button>
        </OverlayTrigger>
      </Tooltip>
      <OverlayPanel className={styles.panel}>
        <OverlayHeader
          header={title}
          description={descriptions[scope]}
          actions={
            <Button
              aria-label={`Close ${title.toLowerCase()}`}
              sentiment="neutral"
              appearance="transparent"
              onClick={() => setOpen(false)}
            >
              <CloseIcon aria-hidden />
            </Button>
          }
        />
        <OverlayPanelContent className={styles.content}>
          <StackLayout className={styles.fields} gap={1}>
            {onDensityChange ? (
              <StackLayout gap={0.75} align="baseline" padding={0}>
                <Text id={densityLabelId} styleAs="label" color="secondary">
                  <strong>Density</strong>
                </Text>
                <Dropdown<Density>
                  bordered
                  aria-labelledby={densityLabelId}
                  selected={density ? [density] : []}
                  onSelectionChange={(_event, [selected]) => {
                    if (selected) {
                      onDensityChange(selected);
                    }
                  }}
                  valueToString={getDensityDisplayName}
                >
                  {densityOptions.map((value) => (
                    <Option key={value} value={value} />
                  ))}
                </Dropdown>
              </StackLayout>
            ) : null}
            <StackLayout gap={0.75} align="baseline" padding={0}>
              <Text id={modeLabelId} styleAs="label" color="secondary">
                <strong>Mode</strong>
              </Text>
              <ToggleButtonGroup
                className={styles.toggleGroup}
                aria-labelledby={modeLabelId}
                value={mode}
                onChange={(event) =>
                  onModeChange(event.currentTarget.value as PreviewMode)
                }
              >
                <ToggleButton value="system">System</ToggleButton>
                <ToggleButton value="light">Light</ToggleButton>
                <ToggleButton value="dark">Dark</ToggleButton>
              </ToggleButtonGroup>
            </StackLayout>
            <StackLayout gap={0.75} align="baseline" padding={0}>
              <Text id={themeLabelId} styleAs="label" color="secondary">
                <strong>Themes</strong>
              </Text>
              <Dropdown<T>
                bordered
                aria-labelledby={themeLabelId}
                selected={theme ? [theme] : []}
                onSelectionChange={(_event, [selected]) => {
                  if (selected) {
                    onThemeChange(selected);
                  }
                }}
                valueToString={getThemeLabel}
              >
                {themeOptions.map(({ value }) => (
                  <Option key={value} value={value} />
                ))}
              </Dropdown>
            </StackLayout>
          </StackLayout>
        </OverlayPanelContent>
        <OverlayFooter className={styles.footer}>
          <Button
            sentiment="neutral"
            appearance="transparent"
            onClick={onReset}
          >
            <RefreshIcon aria-hidden />
            Reset to defaults
          </Button>
        </OverlayFooter>
      </OverlayPanel>
    </Overlay>
  );
}
