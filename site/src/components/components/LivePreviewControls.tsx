import { FC, ReactElement, useState, createContext, ChangeEvent } from "react";
import clsx from "clsx";
import {
  Switch,
  ToggleButtonGroup,
  ToggleButton,
  ToggleButtonGroupChangeEventHandler,
} from "@salt-ds/lab";
import { LightIcon, DarkIcon } from "@salt-ds/icons";
import { SaltProvider, Density, Mode } from "@salt-ds/core";
import ExamplesListView from "./ExamplesListView";
import useIsMobileView from "../../utils/useIsMobileView";

import styles from "./LivePreviewControls.module.css";

type LivePreviewControlsProps = {
  children: ReactElement[];
};

const densities: Density[] = ["high", "medium", "low", "touch"];

const modes: Mode[] = ["light", "dark"];

const defaultDensity = densities[1];

const defaultMode = modes[0];

export type LivePreviewContextType = {
  density?: Density;
  mode?: Mode;
};

export const LivePreviewContext = createContext<LivePreviewContextType>({});

export const LivePreviewControls: FC<LivePreviewControlsProps> = ({
  children,
}) => {
  const [density, setDensity] = useState<Density>(defaultDensity);

  const [mode, setMode] = useState<Mode>(defaultMode);

  const [allExamplesView, setAllExamplesView] = useState(false);

  const isMobileView = useIsMobileView();

  const handleDensityChange: ToggleButtonGroupChangeEventHandler = (
    _,
    index
  ) => {
    const density = densities.find((_, densityIndex) => densityIndex === index);

    setDensity(density ?? defaultDensity);
  };

  const handleModeChange: ToggleButtonGroupChangeEventHandler = (_, index) => {
    const mode = modes.find((_, modeIndex) => modeIndex === index);

    setMode(mode ?? defaultMode);
  };

  const handleAllExamplesChange = (
    _: ChangeEvent<HTMLInputElement>,
    isChecked: boolean
  ) => {
    setAllExamplesView(isChecked);
  };

  return (
    <>
      <SaltProvider density="medium">
        <div className={styles.controls}>
          {!isMobileView && (
            <Switch
              label="All examples"
              checked={allExamplesView}
              onChange={handleAllExamplesChange}
            />
          )}
          <div className={styles.toggleButtonGroups}>
            <div
              className={clsx(styles.density, {
                [styles.smallViewport]: isMobileView,
              })}
            >
              <span>Density</span>
              <ToggleButtonGroup
                selectedIndex={densities.findIndex(
                  (currentDensity) => currentDensity === density
                )}
                onChange={handleDensityChange}
              >
                <ToggleButton aria-label="high density">
                  {isMobileView ? "HD" : "High"}
                </ToggleButton>
                <ToggleButton aria-label="medium density">
                  {isMobileView ? "MD" : "Medium"}
                </ToggleButton>
                <ToggleButton aria-label="low density">
                  {isMobileView ? "LD" : "Low"}
                </ToggleButton>
                <ToggleButton aria-label="touch density">
                  {isMobileView ? "TD" : "Touch"}
                </ToggleButton>
              </ToggleButtonGroup>
            </div>

            <div
              className={clsx(styles.mode, {
                [styles.smallViewport]: isMobileView,
              })}
            >
              <span>Mode</span>
              <ToggleButtonGroup onChange={handleModeChange}>
                <ToggleButton aria-label="light mode">
                  <LightIcon /> {!isMobileView && " Light"}
                </ToggleButton>
                <ToggleButton aria-label="dark mode">
                  <DarkIcon /> {!isMobileView && " Dark"}
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>
        </div>
      </SaltProvider>
      <LivePreviewContext.Provider value={{ density, mode }}>
        {allExamplesView ? children : <ExamplesListView examples={children} />}
      </LivePreviewContext.Provider>
    </>
  );
};
