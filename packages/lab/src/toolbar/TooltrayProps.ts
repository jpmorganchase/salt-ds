import type { HTMLAttributes, ReactElement } from "react";

import type { OrientationShape, ToolbarAlignmentProps } from "./ToolbarProps";

type collapsibleType = "dynamic" | "instant";
type booleanAttribute = "true" | "false";

/**
 * @deprecated since 1.0.0-alpha.110. Use `Toolbar` from `@salt-ds/core` instead.
 */
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
  overflowButtonIcon?: ReactElement;
  overflowButtonLabel?: string;
  orientation?: OrientationShape;
}
