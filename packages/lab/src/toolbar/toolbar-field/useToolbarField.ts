import { clsx } from "clsx";
import {
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
} from "react";
import { ToolbarButton } from "../ToolbarButton";
import type { ToolbarFieldProps } from "./toolbarFieldTypes";

type TypeWithDisplayName = { displayName: string };
type ActivationIndicator = ToolbarFieldProps["ActivationIndicatorComponent"];
type ToolbarFormFieldVariant = "primary" | "tertiary";

const NullActivationIndicator = () => null;
const primaryControls = ["Dropdown", "Input"];

const getChildElementName = (element: ReactNode): string => {
  if (isValidElement(element)) {
    const { type } = element;
    if (typeof type === "string") {
      return type;
    }
    if (typeof type.name === "string") {
      return type.name;
    }
    if ("displayName" in type) {
      return (type as TypeWithDisplayName).displayName;
    }
    return "";
  }
  throw Error(
    "useToolbarField, child of ToolbarField is not valid ReactElememnt",
  );
};

// ToolbarButton gets special styling treatment in the OverflowPanel but styling is
// applied to the FormField, so we need to target those FormFields hosting ToolbarButtons.
const isToolbarButton = (element: ReactElement): boolean =>
  isValidElement(element) && element.type === ToolbarButton;

// Some props for Toolbar FormFields depend on the control hosted by
// the FormField.
export const getToolbarFormFieldProps = (
  child: ReactNode,
  isOverflowPanel = false,
): ToolbarFieldProps => {
  let activationIndicator: ActivationIndicator = NullActivationIndicator;
  let variant: ToolbarFormFieldVariant = "tertiary";
  const element = child as ReactElement;
  if (isValidElement(element)) {
    const name = getChildElementName(element);
    if (primaryControls.includes(name)) {
      activationIndicator = undefined;
      variant = "primary";
    }
  }
  return {
    ActivationIndicatorComponent: activationIndicator,
    className: clsx({
      "saltFormFieldLegacy-toolbarButton":
        isOverflowPanel && isToolbarButton(element),
      [`saltFormFieldLegacy-${variant}`]: variant,
    }),
    fullWidth: false,
  };
};

// Eventually this list needs to be configurable at the Toolbar level
const InteractiveComponents = ["Input", "Dropdown"];

export const useToolbarField = (
  props: ToolbarFieldProps,
): ToolbarFieldProps => {
  const {
    ActivationIndicatorComponent: ActivationIndicatorComponentProp,
    className: classNameProp,
    inOverflowPanel,
    labelPlacement: labelPlacementProp,
    onClick,
    ...rest
  } = props;

  const childElementName = getChildElementName(props.children);
  const { className, ActivationIndicatorComponent, ...calculatedProps } =
    getToolbarFormFieldProps(props.children, inOverflowPanel);

  const labelPlacement =
    labelPlacementProp ?? (inOverflowPanel ? "top" : "left");

  // disableFocusRing ???

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (onClick && !InteractiveComponents.includes(childElementName)) {
        onClick(e);
      }
    },
    [childElementName, onClick],
  );
  return {
    ActivationIndicatorComponent:
      ActivationIndicatorComponentProp ?? ActivationIndicatorComponent,
    className: clsx("saltToolbarField", classNameProp, className),
    labelPlacement,
    onClick: handleClick,
    ...rest,
    ...calculatedProps,
  };
};
