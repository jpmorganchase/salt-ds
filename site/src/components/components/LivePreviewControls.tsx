import {
  type Accent,
  type Corner,
  type Density,
  FlexItem,
  FlowLayout,
  type Mode,
  SaltProvider,
  type SaltProviderNextProps,
  StackLayout,
  Switch,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { DarkIcon, LightIcon } from "@salt-ds/icons";
import {
  type ChangeEvent,
  type FC,
  type ReactElement,
  type SyntheticEvent,
  createContext,
  useState,
} from "react";
import { useAllExamplesView } from "../../utils/useAllExamplesView";
import useIsMobileView from "../../utils/useIsMobileView";
import ExamplesListView from "./ExamplesListView";

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
  showCode?: boolean;
  onShowCodeToggle?: (showCode: boolean) => void;
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

  const [showCode, setShowCode] = useState<boolean>(false);

  const { allExamplesView, setAllExamplesView } = useAllExamplesView();

  const isMobileView = useIsMobileView();

  const handleDensityChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setDensity(event.currentTarget.value as Density);
  };

  const handleModeChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setMode(event.currentTarget.value as Mode);
  };

  const handleAllExamplesChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAllExamplesView(event.target.checked);
  };

  // Only set this handler function when we are displaying the combined list
  // view, so that showing/hiding code persists when switching between
  // examples. For the "All examples" view, we leave it undefined, which causes
  // each LivePreview to show/hide its code individually.
  const handleShowCodeToggle = !allExamplesView
    ? (showCode: boolean) => {
        setShowCode(showCode);
      }
    : undefined;

  return (
    <>
      <SaltProvider density="medium">
        <StackLayout align="stretch" className={styles.controls} gap={1}>
          <FlexItem className={styles.controlsRow}>
            {!isMobileView && (
              <Switch
                label="All examples"
                checked={allExamplesView}
                onChange={handleAllExamplesChange}
              />
            )}

            <div className={styles.toggleButtonGroups}>
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
                <ToggleButtonGroup
                  aria-label="Select mode"
                  onChange={handleModeChange}
                  value={mode}
                >
                  <ToggleButton aria-label="light mode" value="light">
                    <LightIcon /> {!isMobileView && " Light"}
                  </ToggleButton>
                  <ToggleButton aria-label="dark mode" value="dark">
                    <DarkIcon /> {!isMobileView && " Dark"}
                  </ToggleButton>
                </ToggleButtonGroup>
              </StackLayout>
            </div>
          </FlexItem>
          <FlexItem align="end">
            <FlowLayout align="center">
              <Switch
                label="Theme next"
                checked={themeNext}
                onChange={() => setThemeNext((prev) => !prev)}
              />

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
          </FlexItem>
        </StackLayout>
      </SaltProvider>
      <LivePreviewContext.Provider
        value={{
          density,
          mode,
          showCode,
          onShowCodeToggle: handleShowCodeToggle,
          themeNext,
          accent,
          corner,
        }}
      >
        {allExamplesView ? children : <ExamplesListView examples={children} />}
      </LivePreviewContext.Provider>
    </>
  );
};
