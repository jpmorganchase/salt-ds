import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import trackerConnectorCss from "./TrackerConnector.css";

const withBaseName = makePrefixer("saltTrackerConnector");

type ConnectorState = "default" | "active" | "completed";

type TrackerConnectorProps = {
  state: ConnectorState;
  disabled: boolean;
};

export const TrackerConnector = ({
  state,
  disabled,
}: TrackerConnectorProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tracker-connector",
    css: trackerConnectorCss,
    window: targetWindow,
  });

  return (
    <span
      className={clsx(withBaseName(), withBaseName(state), {
        [withBaseName("disabled")]: disabled,
      })}
    />
  );
};
