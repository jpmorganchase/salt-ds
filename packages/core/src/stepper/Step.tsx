import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useContext,
  useEffect,
} from "react";
import type { ButtonProps } from "../button";
import { makePrefixer, useControlled, useId } from "../utils";
import { StepConnector } from "./internal/StepConnector";
import { StepExpandTrigger } from "./internal/StepExpandTrigger";
import { StepIcon } from "./internal/StepIcon";
import {
  StepDepthContext,
  StepperOrientationContext,
} from "./internal/StepperProvider";
import { StepScreenReaderOnly } from "./internal/StepScreenReaderOnly";
import { StepText } from "./internal/StepText";
import stepCSS from "./Step.css";
import { Stepper } from "./Stepper";

export interface StepProps
  extends Omit<ComponentPropsWithoutRef<"li">, "onToggle"> {
  /**
   * The label of the step
   */
  label?: ReactNode;
  /**
   * Description text is displayed just below the label
   **/
  description?: ReactNode;
  /**
   * Optional string to determine the status of the step.
   */
  status?: StepStatus;
  /**
   * The stage of the step
   */
  stage?: StepStage;
  /**
   * Whether the step item is expanded.
   */
  expanded?: boolean;
  /**
   * Initial expanded state of the step.
   */
  defaultExpanded?: boolean;
  /**
   * Callback fired when the step is toggled.
   */
  onToggle?: ButtonProps["onClick"];
}

export type StepId = string;

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
}

const withBaseName = makePrefixer("saltStep");

export const Step = forwardRef<HTMLLIElement, StepProps>(function Step(
  {
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
    children,
    ...rest
  },
  ref,
) {
  const id = useId(idProp);
  const targetWindow = useWindow();
  const depth = useContext(StepDepthContext);
  const orientation = useContext(StepperOrientationContext);

  const hasNestedSteps = !!children;

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
        console.warn("<Step /> should be used within a <Stepper /> component!");
      }
      if (depth > 2) {
        console.warn("<Step /> should not be nested more than 2 levels deep!");
      }
      if (orientation === "horizontal" && hasNestedSteps) {
        console.warn(
          "<Stepper /> does not support nested steps in horizontal orientation!",
        );
      }
    }
  }, [depth, orientation]);

  const ariaCurrent = stage === "active" ? "step" : undefined;
  const iconSizeMultiplier = depth === 0 ? 1.5 : 1;
  const stageText = stage === "inprogress" ? "in progress" : stage;
  const state = status || stageText;

  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const expandTriggerId = `${id}-expand-trigger`;
  const nestedStepperId = `${id}-nested-stepper`;

  const screenReaderOnly = {
    stateId: `${id}-sr-only-state`,
    stateText: state !== "active" ? state : "",
    substepsId: `${id}-sr-only-substeps`,
    substepsText: "substeps",
    toggleSubstepsId: `${id}-sr-only-toggle-substeps`,
    toggleSubstepsText: "toggle substeps",
  };

  return (
    <li
      id={id}
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
      {...rest}
      ref={ref}
    >
      <StepScreenReaderOnly>
        {`${label} ${description !== undefined ? description : ""} ${screenReaderOnly.stateText}`}
      </StepScreenReaderOnly>
      {hasNestedSteps && (
        <>
          <StepScreenReaderOnly
            id={screenReaderOnly.toggleSubstepsId}
            aria-hidden
          >
            {screenReaderOnly.toggleSubstepsText}
          </StepScreenReaderOnly>
          <StepScreenReaderOnly id={screenReaderOnly.substepsId} aria-hidden>
            {screenReaderOnly.substepsText}
          </StepScreenReaderOnly>
          <StepScreenReaderOnly id={screenReaderOnly.stateId} aria-hidden>
            {screenReaderOnly.stateText}
          </StepScreenReaderOnly>
        </>
      )}
      <StepConnector />
      <StepIcon
        stage={stage}
        status={status}
        sizeMultiplier={iconSizeMultiplier}
        aria-hidden
      />
      {label && (
        <StepText id={labelId} purpose="label" aria-hidden>
          {label}
        </StepText>
      )}
      {description && (
        <StepText id={descriptionId} purpose="description" aria-hidden>
          {description}
        </StepText>
      )}
      {hasNestedSteps && orientation === "vertical" && (
        <StepExpandTrigger
          id={expandTriggerId}
          aria-expanded={expanded}
          aria-controls={nestedStepperId}
          aria-labelledby={[
            labelId,
            descriptionId,
            screenReaderOnly.stateId,
            screenReaderOnly.toggleSubstepsId,
          ].join(" ")}
          expanded={expanded}
          onClick={(event) => {
            onToggle?.(event);
            setExpanded(!expanded);
          }}
        />
      )}
      {hasNestedSteps && orientation === "vertical" && (
        <Stepper
          id={nestedStepperId}
          aria-labelledby={[labelId, screenReaderOnly.substepsId].join(" ")}
          aria-hidden={!expanded}
          hidden={!expanded}
        >
          {children}
        </Stepper>
      )}
    </li>
  );
});
