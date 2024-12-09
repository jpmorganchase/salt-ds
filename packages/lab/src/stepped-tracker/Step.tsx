import {
  type ButtonProps,
  makePrefixer,
  useControlled,
  useId,
} from "@salt-ds/core";
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

import { StepConnector } from "./Step.Connector";
import { StepDescription } from "./Step.Description";
import { StepExpandTrigger } from "./Step.ExpandTrigger";
import { StepIcon } from "./Step.Icon";
import { StepLabel } from "./Step.Label";
import stepCSS from "./Step.css";
import { SteppedTracker } from "./SteppedTracker";
import { DepthContext } from "./SteppedTracker.Provider";

export namespace Step {
  export interface Props
    extends Omit<ComponentPropsWithoutRef<"li">, "onToggle"> {
    label?: ReactNode;
    description?: ReactNode;
    status?: Step.Status;
    stage?: Step.Stage;
    expanded?: boolean;
    defaultExpanded?: boolean;
    onToggle?: ButtonProps["onClick"];
    substeps?: Step.Record[];
    children?: ReactNode;
  }

  export type Record =
    | (Omit<Step.Props, "children"> & { id: string })
    | (Omit<Step.Props, "children"> & { key: string });

  export type Status = "warning" | "error";
  export type Stage =
    | "pending"
    | "locked"
    | "completed"
    | "inprogress"
    | "active";

  export type Depth = number;
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
}: Step.Props) {
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

  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const expandTriggerId = `${id}-expand-trigger`;
  const nestedSteppedTrackerId = `${id}-nested-stepped-tracker`;

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
      <StepConnector />
      <StepIcon
        stage={stage}
        status={status}
        sizeMultiplier={iconSizeMultiplier}
      />
      {label && (
        <StepLabel id={labelId} stage={stage} status={status}>
          {label}
        </StepLabel>
      )}
      {description && (
        <StepDescription id={descriptionId}>{description}</StepDescription>
      )}
      {hasNestedSteps && (
        <StepExpandTrigger
          id={expandTriggerId}
          aria-expanded={expanded}
          aria-labelledby={labelId}
          aria-controls={nestedSteppedTrackerId}
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
          aria-label={`${label} substeps`}
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
