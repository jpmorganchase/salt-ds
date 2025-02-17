import {
  type Density,
  Dropdown,
  FlexItem,
  FormField,
  FormFieldLabel,
  type Mode,
  Option,
  SaltProvider,
  type SaltProviderNextProps,
  StackLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  useBreakpoint,
} from "@salt-ds/core";
import { DarkIcon, LightIcon } from "@salt-ds/icons";
import {
  type FC,
  type ReactElement,
  type SyntheticEvent,
  createContext,
  useState,
} from "react";

import clsx from "clsx";
import styles from "./LivePreviewControls.module.css";

type LivePreviewControlsProps = {
  children: ReactElement[];
};

const densities: Density[] = ["high", "medium", "low", "touch"];

const modes: Mode[] = ["light", "dark"];

const defaultDensity = densities[1];

const defaultMode = modes[0];

type Theme = "legacy" | "brand";
const defaultTheme = "legacy";

const themeToDisplayName = {
  legacy: "Legacy UITK",
  brand: "JPM Brand",
};

export type LivePreviewContextType = Pick<
  SaltProviderNextProps,
  "mode" | "density"
> & {
  theme?: Theme;
};

export const LivePreviewContext = createContext<LivePreviewContextType>({});

export const LivePreviewControls: FC<LivePreviewControlsProps> = ({
  children,
}) => {
  const [density, setDensity] = useState<Density>(defaultDensity);
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  const { matchedBreakpoints } = useBreakpoint();
  const isMobileView = !matchedBreakpoints.includes("md");

  const handleDensityChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setDensity(event.currentTarget.value as Density);
  };

  const handleModeChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setMode(event.currentTarget.value as Mode);
  };

  const handleThemeChange = (_: SyntheticEvent, newTheme: Theme[]) => {
    setTheme(newTheme[0]);
  };

  const themeNextSwitch = (
    <div>
      <FormField
        labelPlacement={isMobileView ? "top" : "left"}
        style={{ "--saltFormField-label-width": "5.6ch" } as any}
      >
        <FormFieldLabel>Theme</FormFieldLabel>
        <Dropdown
          bordered
          selected={[theme]}
          onSelectionChange={handleThemeChange}
          style={{ minWidth: "16ch" }}
          valueToString={(value) => themeToDisplayName[value]}
        >
          <Tooltip
            disabled={isMobileView}
            content="The legacy UITK theme enables phased migration from UITK to Salt."
          >
            <Option value="legacy" />
          </Tooltip>
          <Tooltip
            disabled={isMobileView}
            content="The JPM Brand theme (previously the Salt Next theme) brings the JPM Brand identity to CIB (Commercial & Investment Bank) digital applications and is the long-term visual identity of the Salt system."
          >
            <Option value="brand" />
          </Tooltip>
        </Dropdown>
      </FormField>
    </div>
  );

  const responsiveToggleGroupDirection = {
    xs: "column",
    md: "row",
  } as const;

  const densityToggleGroup = (
    <StackLayout
      gap={0.75}
      align="baseline"
      direction={responsiveToggleGroupDirection}
    >
      <Text styleAs="label" color="secondary">
        <strong>Density</strong>
      </Text>
      <ToggleButtonGroup
        aria-label="Select density"
        value={density}
        onChange={handleDensityChange}
      >
        <ToggleButton aria-label="high density" value="high">
          {isMobileView ? "HD" : "High"}
        </ToggleButton>
        <ToggleButton aria-label="medium density" value="medium">
          {isMobileView ? "MD" : "Medium"}
        </ToggleButton>
        <ToggleButton aria-label="low density" value="low">
          {isMobileView ? "LD" : "Low"}
        </ToggleButton>
        <ToggleButton aria-label="touch density" value="touch">
          {isMobileView ? "TD" : "Touch"}
        </ToggleButton>
      </ToggleButtonGroup>
    </StackLayout>
  );

  const modeToggleGroup = (
    <StackLayout
      gap={0.75}
      align="baseline"
      direction={responsiveToggleGroupDirection}
    >
      <Text styleAs="label" color="secondary">
        <strong>Mode</strong>
      </Text>
      <FlexItem>
        <ToggleButtonGroup
          aria-label="Select mode"
          onChange={handleModeChange}
          value={mode}
        >
          <ToggleButton aria-label="light mode" value="light">
            {!isMobileView && " Light"} <LightIcon />
          </ToggleButton>
          <ToggleButton aria-label="dark mode" value="dark">
            {!isMobileView && " Dark"} <DarkIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </FlexItem>
    </StackLayout>
  );

  return (
    <>
      <SaltProvider density="medium">
        <div
          className={clsx(styles.controls, {
            [styles.stickyControls]: !isMobileView,
          })}
        >
          {densityToggleGroup}
          {modeToggleGroup}
          {themeNextSwitch}
        </div>
      </SaltProvider>
      <LivePreviewContext.Provider
        value={{
          density,
          mode,
          theme,
        }}
      >
        {children}
      </LivePreviewContext.Provider>
    </>
  );
};
