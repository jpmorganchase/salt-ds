import {
  useContext,
  useState,
  useEffect,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import clsx from "clsx";
import { useWindow } from "@salt-ds/window";
import { Text, makePrefixer, type ButtonProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";

import stepCSS from "./Step.css";

import { Stepper } from "./Stepper";
import { StepTrack } from "./StepTrack";
import { StepIcon } from "./StepIcon";
import { StepExpandTrigger } from "./StepExpandTrigger";
import { DepthContext } from "./StepperProvider";

export namespace Step {
  export interface Props extends ComponentProps<"li"> {
    label?: ReactNode;
    description?: ReactNode;
    stage?: Stage;
    status?: Status;
    defaultExpanded?: boolean;
    onToggle?: ButtonProps["onClick"];
    disabled?: boolean;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
  }

  export type Stage = 
    | "pending"
    | "completed"
    | "inprogress"
    | "active";

  export type Status = "warning" | "error";

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
  const depth = useContext(DepthContext);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-step",
    css: stepCSS,
    window: targetWindow,
  });

  useEffect(() => {
    if (depth === -1) {
      console.warn("<Step /> should be used within a <Stepper /> component");
    }
  }, [depth]);

  const iconMultiplier = depth === 0 ? 1.5 : 1;
  const hasNestedSteps = !!children;

  return (
    <li
      className={clsx(
        withBaseName(),
        withBaseName(`stage-${stage}`),
        withBaseName(`depth-${depth}`),
        status && withBaseName(`status-${status}`),
        hasNestedSteps && withBaseName("with-nested-steps"),
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
      <StepTrack />
      <StepIcon stage={stage} status={status} multiplier={iconMultiplier} />
      {label && (
        <Text className={withBaseName("label")}>
          <strong>{label}</strong>
        </Text>
      )}
      {description && (
        <Text styleAs="label" className={withBaseName("description")}>
          {description}
        </Text>
      )}
      {hasNestedSteps && (
        <StepExpandTrigger
          label={"Show Substeps"}
          expanded={expanded}
          onClick={(event) => {
            onToggle?.(event);
            setExpanded(!expanded);
          }}
        />
      )}
      {hasNestedSteps && (
        <Stepper>
          {children}
        </Stepper>
      )}
    </li>
  );
}
