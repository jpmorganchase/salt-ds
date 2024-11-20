import {
  useContext,
  useState,
  useEffect,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type ReactElement,
} from "react";
import clsx from "clsx";
import {
  Text,
  useId,
  useControlled,
  makePrefixer,
  type ButtonProps
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
  export interface Props extends ComponentProps<"li"> {
    label?: ReactNode;
    description?: ReactNode;
    icon?: ReactElement;
    status?: Status;
    stage?: Stage;
    disabled?: boolean;
    expanded?: boolean;
    defaultExpanded?: boolean;
    onToggle?: ButtonProps["onClick"];
    children?: ReactNode;
  }

  export type Status =
    | "warning"
    | "error";

  export type Stage = 
    | "pending"
    | "completed"
    | "inprogress"
    | "active"
    | "locked"  
  ;

  export type Depth = number;
}

const withBaseName = makePrefixer("saltStep");

// Remove disabled Step variant
// Add locked stage Step variant
// Status comes before stage
// Icon align to top when vertical and more than one line of text
export function Step({
  id: idProp,
  label,
  icon,
  description,
  status,
  stage = "pending",
  expanded: expandedProp,
  defaultExpanded = false,
  onToggle,
  className,
  style,
  children,
  disabled = false,
  ...props
}: Step.Props) {
  const id = useId(idProp);
  const targetWindow = useWindow();
  const depth = useContext(DepthContext);

  const [expanded, setExpanded] = useControlled({
    controlled: expandedProp,
    default: Boolean(defaultExpanded),
    name: "Step",
    state: "expanded"
  })

  useComponentCssInjection({
    testId: "salt-step",
    css: stepCSS,
    window: targetWindow,
  });

  useEffect(() => {
    if(depth === -1) {
      console.warn(
        "<Step /> should be used within a <Stepper /> component!"
      );
    }

    if(depth > 2) {
      console.warn(
        "<Step /> should not be nested more than 2 levels deep!"
      );
    }
  }, [depth]);

  const iconMultiplier = depth === 0 ? 1.5 : 1;
  const hasNestedSteps = !!children;

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
        disabled && withBaseName("disabled"),
        className,
      )}
      style={{
        "--saltStep-depth": depth,
        ...style,
      } as CSSProperties}
      {...props}
    >
      <div className={withBaseName('content')}>
        <StepConnector />
        <StepIcon
          stage={stage}
          status={status}
          multiplier={iconMultiplier}
          element={icon}
        />
        {label && (
          <Text
            id={labelId}
            className={withBaseName("label")}
          >
            {label}
          </Text>
        )}
        {description && (
          <Text
            styleAs="label"
            className={withBaseName("description")}
          >
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
            {children}
          </Stepper>
        )}
      </div>
    </li>
  );
}