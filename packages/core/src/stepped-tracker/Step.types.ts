import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { ButtonProps } from "../button";

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
