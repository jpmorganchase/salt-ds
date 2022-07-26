import { HTMLAttributes } from "react";

import { OrientationShape } from "./ToolbarProps";
import { OverflowMenuProps } from "../responsive";

type collapsibleType = "dynamic" | "instant";
type booleanAttribute = "true" | "false";

export interface TooltrayProps extends HTMLAttributes<HTMLDivElement> {
  OverflowButtonProps?: Omit<Partial<OverflowMenuProps>, "ref">;
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
