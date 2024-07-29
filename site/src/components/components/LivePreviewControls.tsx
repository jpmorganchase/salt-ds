import {
  type Density,
  type Mode,
  SaltProvider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@salt-ds/core";
import { DarkIcon, LightIcon } from "@salt-ds/icons";
import clsx from "clsx";
import {
  type FC,
  type ReactElement,
  type SyntheticEvent,
  createContext,
  useState,
} from "react";
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

  const isMobileView = useIsMobileView();

  const handleDensityChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setDensity(event.currentTarget.value as Density);
  };

  const handleModeChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setMode(event.currentTarget.value as Mode);
  };

  return (
    <>
      <SaltProvider density="medium">
        <div className={styles.controls}>
          <div className={styles.toggleButtonGroups}>
            <div
              className={clsx(styles.density, {
                [styles.smallViewport]: isMobileView,
              })}
            >
              <span>Density</span>
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
            </div>

            <div
              className={clsx(styles.mode, {
                [styles.smallViewport]: isMobileView,
              })}
            >
              <span>Mode</span>
              <ToggleButtonGroup
                aria-label="Select mode"
                onChange={handleModeChange}
                value={mode}
              >
                <Tooltip content="Light" placement="top">
                  <ToggleButton aria-label="light mode" value="light">
                    <LightIcon />
                  </ToggleButton>
                </Tooltip>
                <Tooltip content="Dark" placement="top">
                  <ToggleButton aria-label="dark mode" value="dark">
                    <DarkIcon />
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </div>
          </div>
        </div>
      </SaltProvider>
      <LivePreviewContext.Provider
        value={{
          density,
          mode,
        }}
      >
        {children}
      </LivePreviewContext.Provider>
    </>
  );
};
