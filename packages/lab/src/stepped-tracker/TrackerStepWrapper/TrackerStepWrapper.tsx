import { Button, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, type ReactNode, useState } from "react";

import { ChevronDownIcon, ChevronUpIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { TrackerStepProvider } from "../SteppedTrackerContext";

import trackerStepWrapperCss from "./TrackerStepWrapper.css";

const withBaseName = makePrefixer("saltTrackerStepWrapper");

export interface TrackerStepWrapperProps
  extends ComponentPropsWithoutRef<"ul"> {
  child: ReactNode;
  stepNumber: number;
}

export const TrackerStepWrapper = (props: TrackerStepWrapperProps) => {
  const { children, child, stepNumber } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tracker-step",
    css: trackerStepWrapperCss,
    window: targetWindow,
  });

  const [expanded, setExpanded] = useState(true);

  const handleCollapseToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <TrackerStepProvider stepNumber={stepNumber}>
        <div className={withBaseName()}>
          {child}
          <Button
            className={withBaseName("collapse-toggle")}
            onClick={handleCollapseToggle}
            variant="secondary"
          >
            {expanded ? (
              <ChevronUpIcon
                aria-label="clear input"
                className={withBaseName("expand-icon")}
              />
            ) : (
              <ChevronDownIcon
                aria-label="clear input"
                className={withBaseName("expand-icon")}
              />
            )}
          </Button>
        </div>
      </TrackerStepProvider>
      <div
        className={clsx(withBaseName("nested-group"), {
          [withBaseName("nested-group-expanded")]: expanded,
          [withBaseName("nested-group-collapsed")]: !expanded,
        })}
        data-parent-step={stepNumber}
        aria-hidden={!expanded ? "true" : undefined}
        hidden={!expanded}
      >
        <ul className={withBaseName("nested-group-inner")}>{children}</ul>
      </div>
    </>
  );
};
