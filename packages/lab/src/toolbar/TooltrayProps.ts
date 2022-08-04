import { HTMLAttributes } from "react";

import { OrientationShape, ToolbarAlignmentProps } from "./ToolbarProps";

type collapsibleType = "dynamic" | "instant";
type booleanAttribute = "true" | "false";

export interface TooltrayProps
  extends ToolbarAlignmentProps,
    HTMLAttributes<HTMLDivElement> {
  collapse?: boolean;
  collapsed?: boolean;
  collapsible?: boolean;
  disabled?: boolean;
  "data-collapsible"?: collapsibleType;
  "data-collapsed"?: booleanAttribute;
  isInsidePanel?: boolean;
  overflowButtonIcon?: JSX.Element;
  overflowButtonLabel?: string;
  orientation?: OrientationShape;
}
