import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import trackerConnectorCss from "./TrackerConnector.css";

const withBaseName = makePrefixer("saltTrackerConnector");

type ConnectorState = "default" | "active";

interface TrackerConnectorProps {
  /**
   * The state of the connector, which acts as an indicator of whether the active step is ahead/behind
   */
  state: ConnectorState;
}

export const TrackerConnector = ({ state }: TrackerConnectorProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tracker-connector",
    css: trackerConnectorCss,
    window: targetWindow,
  });

  return <span className={clsx(withBaseName(), withBaseName(state))} />;
};
