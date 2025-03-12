import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type ReactNode,
  useContext,
  useEffect,
} from "react";
import { makePrefixer, useControlled, useId } from "../utils";

import type { ButtonProps } from "../button";
import { StepConnector } from "./internal/StepConnector";
import { StepDescription } from "./internal/StepDescription";
import { StepExpandTrigger } from "./internal/StepExpandTrigger";
import { StepIcon } from "./internal/StepIcon";
import { StepLabel } from "./internal/StepLabel";
import { StepScreenReaderOnly } from "./internal/StepScreenReaderOnly";
import stepCSS from "./Step.css";
import { SteppedTracker } from "./SteppedTracker";
import { DepthContext } from "./internal/SteppedTrackerProvider";

export interface StepProps
  extends Omit<ComponentPropsWithoutRef<"li">, "onToggle"> {
  label?: ReactNode;
  description?: ReactNode;
  status?: StepStatus;
  stage?: StepStage;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onToggle?: ButtonProps["onClick"];
  substeps?: StepRecord[];
  children?: ReactNode;
}

export type StepRecord = Omit<StepProps, "children"> & { id: string };

export type StepStatus = "warning" | "error";
export type StepStage =
  | "pending"
  | "locked"
  | "completed"
  | "inprogress"
  | "active";

export type StepDepth = number;

export interface StepProps
  extends Omit<ComponentPropsWithoutRef<"li">, "onToggle"> {
  label?: ReactNode;
  description?: ReactNode;
  status?: StepStatus;
  stage?: StepStage;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onToggle?: ButtonProps["onClick"];
  substeps?: StepRecord[];
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltStep");

export function Step({
  id: idProp,
  label,
  description,
  status,
  stage = "pending",
  expanded: expandedProp,
  defaultExpanded,
  onToggle,
  className,
  style,
  substeps,
  children,
  ...props
}: StepProps) {
  const id = useId(idProp);
  const targetWindow = useWindow();
  const depth = useContext(DepthContext);

  const [expanded, setExpanded] = useControlled({
    name: "Step",
    state: "expanded",
    controlled: expandedProp,
    default: Boolean(defaultExpanded),
  });

  useComponentCssInjection({
    testId: "salt-step",
    css: stepCSS,
    window: targetWindow,
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (depth === -1) {
        console.warn(
          "<Step /> should be used within a <SteppedTracker /> component!",
        );
      }

      if (depth > 2) {
        console.warn("<Step /> should not be nested more than 2 levels deep!");
      }
    }
  }, [depth]);

  const ariaCurrent = stage === "active" ? "step" : undefined;
  const iconSizeMultiplier = depth === 0 ? 1.5 : 1;
  const hasNestedSteps = !!children || !!substeps;
  const state = status || stage;

  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const expandTriggerId = `${id}-expand-trigger`;
  const nestedSteppedTrackerId = `${id}-nested-stepped-tracker`;

  const srOnly = {
    stateId: `${id}-sr-only-state`,
    stateText: state !== "active" ? state : undefined,
    substepsId: `${id}-sr-only-substeps`,
    substepsText: "substeps",
    toggleSubstepsId: `${id}-sr-only-toggle-substeps`,
    toggleSubstepsText: "toggle substeps",
  };

  return (
    <li
      id={id}
      data-stage={stage}
      data-status={status}
      data-depth={depth}
      aria-current={ariaCurrent}
      className={clsx(
        withBaseName(),
        withBaseName(`stage-${stage}`),
        withBaseName(`depth-${depth}`),
        status && withBaseName(`status-${status}`),
        !hasNestedSteps && withBaseName("terminal"),
        hasNestedSteps && expanded && withBaseName("expanded"),
        hasNestedSteps && !expanded && withBaseName("collapsed"),
        className,
      )}
      style={
        {
          "--saltStep-depth": depth,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <StepScreenReaderOnly>
        {label} {description} {srOnly.stateText}
      </StepScreenReaderOnly>
      <StepScreenReaderOnly id={srOnly.toggleSubstepsId} aria-hidden>
        {srOnly.toggleSubstepsText}
      </StepScreenReaderOnly>
      <StepScreenReaderOnly id={srOnly.substepsId} aria-hidden>
        {srOnly.substepsText}
      </StepScreenReaderOnly>
      <StepScreenReaderOnly id={srOnly.stateId} aria-hidden>
        {srOnly.stateText}
      </StepScreenReaderOnly>
      <StepConnector />
      <StepIcon
        stage={stage}
        status={status}
        sizeMultiplier={iconSizeMultiplier}
        aria-hidden
      />
      {label && (
        <StepLabel id={labelId} aria-hidden>
          {label}
        </StepLabel>
      )}
      {description && (
        <StepDescription id={descriptionId} aria-hidden>
          {description}
        </StepDescription>
      )}
      {hasNestedSteps && (
        <StepExpandTrigger
          id={expandTriggerId}
          aria-expanded={expanded}
          aria-controls={nestedSteppedTrackerId}
          aria-labelledby={[
            labelId,
            descriptionId,
            srOnly.stateId,
            srOnly.toggleSubstepsId,
          ].join(" ")}
          expanded={expanded}
          onClick={(event) => {
            onToggle?.(event);
            setExpanded(!expanded);
          }}
        />
      )}
      {hasNestedSteps && (
        <SteppedTracker
          id={nestedSteppedTrackerId}
          aria-labelledby={[labelId, srOnly.substepsId].join(" ")}
          aria-hidden={!expanded}
          hidden={!expanded}
        >
          {children}
          {substeps?.map((step) => (
            <Step key={step.id} {...step} />
          ))}
        </SteppedTracker>
      )}
    </li>
  );
}
