import {
  makePrefixer,
  type StepStage,
  type StepStatus,
  Text,
  useIcon,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ElementType,
  forwardRef,
  type ReactNode,
  useContext,
  useEffect,
} from "react";

import compactStepCss from "./CompactStep.css";
import { CompactStepperContext } from "./internal/CompactStepperContext";

export type CompactStepStage = Extract<
  StepStage,
  "pending" | "active" | "locked" | "completed"
>;
export const CompactStepStageValues = [
  "pending",
  "active",
  "locked",
  "completed",
] as const;

export interface CompactStepProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  /**
   * The label of the step.
   */
  label?: ReactNode;
  /**
   * The stage of the step. Mark the current step as `active`, or `locked` when the user can't continue. Without an `active` or `locked` step, the first `pending` step is shown.
   * @default "pending"
   */
  stage?: CompactStepStage;
  /**
   * The status of the step. Shows an error or warning icon in place of the `locked` icon.
   */
  status?: StepStatus;
}

const withBaseName = makePrefixer("saltCompactStep");

type CompactStepState = CompactStepStage | StepStatus;

function useCompactStepIcon(state: CompactStepState) {
  const { ErrorIcon, WarningIcon, LockedIcon } = useIcon();

  const stateToIcon: Partial<Record<CompactStepState, ElementType>> = {
    error: ErrorIcon,
    warning: WarningIcon,
    locked: LockedIcon,
  };

  return stateToIcon[state];
}

export const CompactStep = forwardRef<HTMLSpanElement, CompactStepProps>(
  function CompactStep(
    { label, stage = "pending", status, className, ...rest },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-compact-step",
      css: compactStepCss,
      window: targetWindow,
    });

    const isInCompactStepper = useContext(CompactStepperContext);

    useEffect(() => {
      if (process.env.NODE_ENV !== "production" && !isInCompactStepper) {
        console.warn(
          "<CompactStep /> should be used within a <CompactStepper /> component!",
        );
      }
    }, [isInCompactStepper]);

    // Status takes precedence over stage, as in Step.
    const state = status ?? stage;
    const Icon = useCompactStepIcon(state);
    // As in Step, "active" isn't announced; the step count already marks the current step.
    const stateText = state !== "active" ? state : undefined;

    return (
      <span
        className={clsx(
          withBaseName(),
          withBaseName(`stage-${stage}`),
          status && withBaseName(`status-${status}`),
          className,
        )}
        ref={ref}
        {...rest}
      >
        {Icon && <Icon className={withBaseName("icon")} size={1} aria-hidden />}
        <Text
          as="span"
          styleAs="inherit"
          fontWeight="bolder"
          className={withBaseName("label")}
        >
          {label}
        </Text>
        {stateText && (
          <span className="salt-visuallyHidden">{`, ${stateText}`}</span>
        )}
      </span>
    );
  },
);
