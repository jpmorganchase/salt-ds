import {
  type Accent,
  type Corner,
  type Density,
  FlexItem,
  FlexLayout,
  FlowLayout,
  type Mode,
  SaltProvider,
  type SaltProviderNextProps,
  StackLayout,
  Switch,
  Text,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@salt-ds/core";
import { DarkIcon, HelpIcon, LightIcon } from "@salt-ds/icons";
import {
  type FC,
  type ReactElement,
  type SyntheticEvent,
  createContext,
  useState,
} from "react";
import useIsMobileView from "../../utils/useIsMobileView";

import clsx from "clsx";
import styles from "./LivePreviewControls.module.css";

type LivePreviewControlsProps = {
  children: ReactElement[];
};

const densities: Density[] = ["high", "medium", "low", "touch"];

const modes: Mode[] = ["light", "dark"];

const defaultDensity = densities[1];

const defaultMode = modes[0];

export type LivePreviewContextType = Pick<
  SaltProviderNextProps,
  "accent" | "mode" | "density" | "corner"
> & {
  themeNext?: boolean;
};

export const LivePreviewContext = createContext<LivePreviewContextType>({});

export const LivePreviewControls: FC<LivePreviewControlsProps> = ({
  children,
}) => {
  const [density, setDensity] = useState<Density>(defaultDensity);
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [themeNext, setThemeNext] = useState(false);
  const [accent, setAccent] = useState<Accent>("blue");
  const [corner, setCorner] = useState<Corner>("sharp");

  const isMobileView = useIsMobileView();

  const handleDensityChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setDensity(event.currentTarget.value as Density);
  };

  const handleModeChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setMode(event.currentTarget.value as Mode);
  };

  const themeNextSwitch = (
    <FlexItem align="end" className={styles.switchAlignment}>
      <Tooltip content="Salt Next theme enables more styling options. Refer to Theming page for more information.">
        <Switch
          label={
            <StackLayout gap={0.5} direction="row" align="center">
              <span>Salt Next theme</span>
              <HelpIcon aria-hidden />
            </StackLayout>
          }
          checked={themeNext}
          onChange={() => setThemeNext((prev) => !prev)}
        />
      </Tooltip>
    </FlexItem>
  );

  return (
    <>
      <SaltProvider density="medium">
        <StackLayout
          align="stretch"
          className={clsx(styles.controls, {
            [styles.stickyControls]: !isMobileView,
          })}
          gap={1}
        >
          <FlowLayout
            justify="space-between"
            gap={{
              xs: 1,
              sm: 1,
              md: 1,
              lg: 2,
              xl: 2,
            }}
          >
            <FlowLayout
              align="center"
              gap={{
                xs: 1,
                sm: 1,
                md: 1,
                lg: 2,
                xl: 2,
              }}
            >
              <StackLayout
                gap={0.75}
                align="baseline"
                direction={{
                  xs: "column",
                  sm: "column",
                  md: "row",
                  lg: "row",
                  xl: "row",
                }}
              >
                <Text styleAs="label">Density</Text>
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

              <StackLayout
                gap={0.75}
                align="baseline"
                direction={{
                  xs: "column",
                  sm: "column",
                  md: "row",
                  lg: "row",
                  xl: "row",
                }}
              >
                <Text styleAs="label">Mode</Text>
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
            </FlowLayout>
            {!themeNext ? themeNextSwitch : null}
          </FlowLayout>
          {themeNext ? (
            <FlowLayout
              justify="space-between"
              gap={{
                xs: 1,
                sm: 1,
                md: 1,
                lg: 2,
                xl: 2,
              }}
            >
              <FlowLayout
                align="center"
                gap={{
                  xs: 1,
                  sm: 1,
                  md: 1,
                  lg: 2,
                  xl: 2,
                }}
              >
                <StackLayout
                  gap={0.75}
                  align="baseline"
                  direction={{
                    xs: "column",
                    sm: "column",
                    md: "row",
                    lg: "row",
                    xl: "row",
                  }}
                >
                  <Text styleAs="label">Corner</Text>
                  <ToggleButtonGroup
                    disabled={!themeNext}
                    aria-label="Select corner"
                    value={corner}
                    onChange={() => {
                      setCorner((prev) =>
                        prev === "rounded" ? "sharp" : "rounded",
                      );
                    }}
                  >
                    <ToggleButton value="sharp">Sharp</ToggleButton>
                    <ToggleButton value="rounded">Rounded</ToggleButton>
                  </ToggleButtonGroup>
                </StackLayout>

                <StackLayout
                  gap={0.75}
                  align="baseline"
                  direction={{
                    xs: "column",
                    sm: "column",
                    md: "row",
                    lg: "row",
                    xl: "row",
                  }}
                >
                  <Text styleAs="label">Accent</Text>
                  <ToggleButtonGroup
                    disabled={!themeNext}
                    value={accent}
                    onChange={() => {
                      setAccent((prev) => (prev === "blue" ? "teal" : "blue"));
                    }}
                  >
                    <ToggleButton value="blue">Blue</ToggleButton>
                    <ToggleButton value="teal">Teal</ToggleButton>
                  </ToggleButtonGroup>
                </StackLayout>
              </FlowLayout>

              {themeNextSwitch}
            </FlowLayout>
          ) : null}
        </StackLayout>
      </SaltProvider>
      <LivePreviewContext.Provider
        value={{
          density,
          mode,
          themeNext,
          accent,
          corner,
        }}
      >
        {children}
      </LivePreviewContext.Provider>
    </>
  );
};
