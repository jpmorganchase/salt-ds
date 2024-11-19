import {
  useId,
  useContext,
  useState,
  useEffect,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type ReactElement,
} from "react";
import clsx from "clsx";
import { useWindow } from "@salt-ds/window";
import { Text, makePrefixer, type ButtonProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";

import stepCSS from "./Step.css";

import { Stepper } from "./Stepper";
import { StepConnector } from "./Step.Connector";
import { StepIcon } from "./Step.Icon";
import { StepExpandTrigger } from "./Step.ExpandTrigger";
import { DepthContext, OrientationContext } from "./Stepper.Provider";

type ReactListItem = ComponentProps<"li">;

export namespace Step {
  export interface Props extends ReactListItem {
    label?: ReactNode;
    description?: ReactNode;
    icon?: ReactElement;
    status?: Status;
    stage?: Stage;
    defaultExpanded?: boolean;
    onToggle?: ButtonProps["onClick"];
    disabled?: boolean;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
    stepRef?: ReactListItem["ref"];
  }

  export type Status =
    | "warning"
    | "error";

  export type Stage = 
    | "pending"
    | "completed"
    | "inprogress"
    | "active";

  export type Depth = number; 
}

const withBaseName = makePrefixer("saltStep");

export function Step({
  label,
  description,
  status,
  stage = "pending",
  defaultExpanded = false,
  onToggle,
  className,
  style,
  children,
  ...props
}: Step.Props) {
  const generatedId = useId();
  const targetWindow = useWindow();
  const depth = useContext(DepthContext);
  const [expanded, setExpanded] = useState(defaultExpanded);

  const id = props.id || generatedId;

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
      style={{
        "--saltStep-depth": depth,
        ...style,
      } as CSSProperties}
      {...props}
    >
        <StepIcon
          stage={stage}
          status={status}
          multiplier={iconMultiplier}
        />
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
        <StepConnector />
        {label && (
          <Text
            id={labelId}
            className={withBaseName("label")}
          >
            <strong>{label}</strong>
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
          <Stepper id={nestedStepperId}>
            {children}
          </Stepper>
        )}
    </li>
  );
}
