import {
  useContext,
  useEffect,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import clsx from "clsx";
import {
  Text,
  useId,
  useControlled,
  makePrefixer,
  type ButtonProps,
} from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import stepCSS from "./Step.css";
import { Stepper } from "./Stepper";
import { DepthContext } from "./Stepper.Provider";
import { StepExpandTrigger } from "./Step.ExpandTrigger";
import { StepConnector } from "./Step.Connector";
import { StepIcon } from "./Step.Icon";

export namespace Step {
  export interface Step extends ComponentProps<"li"> {
    id?: string;
    label?: ReactNode;
    description?: ReactNode;
    status?: Status;
    stage?: Stage;
    expanded?: boolean;
    defaultExpanded?: boolean;
    onToggle?: ButtonProps["onClick"];
    substeps?: Step[];
  }

  export interface Props extends Step {
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

// Icon align to top when vertical and more than one line of text
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

  const hasNestedSteps = !!children || !!substeps;
  const iconMultiplier = depth === 0 ? 1.5 : 1;

  const labelId = `step-${id}-label`;
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
      <div className={withBaseName("content")}>
        <StepConnector />
        <StepIcon stage={stage} status={status} multiplier={iconMultiplier} />
        {label && (
          <Text id={labelId} styleAs="label" className={withBaseName("label")}>
            {label}
          </Text>
        )}
        {description && (
          <Text styleAs="label" className={withBaseName("description")}>
            {description}
          </Text>
        )}
        {hasNestedSteps && (
          <StepExpandTrigger
            aria-expanded={expanded}
            aria-labelledby={labelId}
            aria-controls={`step-${id}-nested-stepper`}
            expanded={expanded}
            onClick={(event) => {
              onToggle?.(event);
              setExpanded(!expanded);
            }}
          />
        )}
        {hasNestedSteps && (
          <Stepper id={nestedStepperId}>
            {children ||
              substeps?.map((step) => <Step key={step.id} {...step} />)}
          </Stepper>
        )}
      </div>
    </li>
  );
}
