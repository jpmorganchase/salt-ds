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
  type ComponentProps,
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
import { Stepper } from "./Stepper";
import { DepthContext } from "./Stepper.Provider";

export namespace Step {
  export interface Props extends ComponentProps<"li"> {
    id?: string;
    label?: ReactNode;
    description?: ReactNode;
    status?: Step.Status;
    stage?: Step.Stage;
    expanded?: boolean;
    defaultExpanded?: boolean;
    onToggle?: ButtonProps["onClick"];
    substeps?: Step.Props[];
    children?: ReactNode;
  }

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
    controlled: expandedProp,
    default: Boolean(defaultExpanded),

    name: "Step",
    state: "expanded",
  });

  useComponentCssInjection({
    testId: "salt-step",
    css: stepCSS,
    window: targetWindow,
  });

  useEffect(() => {
    if (depth === -1) {
      console.warn("<Step /> should be used within a <Stepper /> component!");
    }

    if (depth > 2) {
      console.warn("<Step /> should not be nested more than 2 levels deep!");
    }
  }, [depth]);

  const iconMultiplier = depth === 0 ? 1.5 : 1;
  const hasNestedSteps = !!children || !!substeps;
  const labelId = `step-${id}-label`;
  const descriptionId = `step-${id}-description`;
  const nestedStepperId = `step-${id}-nested-stepper`;

  return (
    <li
      id={id}
      data-stage={stage}
      data-status={status}
      data-depth={depth}
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
      <StepIcon stage={stage} status={status} multiplier={iconMultiplier} />
      {label && <StepLabel id={labelId}>{label}</StepLabel>}
      {description && <StepDescription>{description}</StepDescription>}
      {hasNestedSteps && (
        <StepExpandTrigger
          aria-expanded={expanded}
          aria-labelledby={labelId}
          aria-controls={nestedStepperId}
          expanded={expanded}
          onClick={(event) => {
            onToggle?.(event);
            setExpanded(!expanded);
          }}
        />
      )}
      {hasNestedSteps && (
        <Stepper
          id={nestedStepperId}
          aria-hidden={!expanded}
          hidden={!expanded}
        >
          {children ||
            substeps?.map((step) => <Step key={step.id} {...step} />)}
        </Stepper>
      )}
    </li>
  );
}
