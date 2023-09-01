import {
  FC,
  ReactElement,
  useState,
  createContext,
  ChangeEvent,
  SyntheticEvent,
} from "react";
import clsx from "clsx";
import { Switch } from "@salt-ds/lab";
import { LightIcon, DarkIcon } from "@salt-ds/icons";
import {
  SaltProvider,
  ToggleButtonGroup,
  ToggleButton,
  Density,
  Mode,
} from "@salt-ds/core";
import ExamplesListView from "./ExamplesListView";
import useIsMobileView from "../../utils/useIsMobileView";
import { useAllExamplesView } from "../../utils/useAllExamplesView";

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
  showCode?: boolean;
  onShowCodeToggle?: (showCode: boolean) => void;
};

export const LivePreviewContext = createContext<LivePreviewContextType>({});

export const LivePreviewControls: FC<LivePreviewControlsProps> = ({
  children,
}) => {
  const [density, setDensity] = useState<Density>(defaultDensity);

  const [mode, setMode] = useState<Mode>(defaultMode);

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
                <ToggleButton aria-label="light mode" value="light">
                  <LightIcon /> {!isMobileView && " Light"}
                </ToggleButton>
                <ToggleButton aria-label="dark mode" value="dark">
                  <DarkIcon /> {!isMobileView && " Dark"}
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>
        </div>
      </SaltProvider>
      <LivePreviewContext.Provider
        value={{ density, mode, showCode, onShowCodeToggle: setShowCode }}
      >
        {allExamplesView ? children : <ExamplesListView examples={children} />}
      </LivePreviewContext.Provider>
    </>
  );
};
