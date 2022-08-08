import cx from "classnames";
import {
  isValidElement,
  MouseEvent,
  ReactElement,
  ReactNode,
  useCallback,
} from "react";
import { ToolbarButton } from "../ToolbarButton";
import { ToolbarFieldProps } from "./toolbarFieldTypes";

type TypeWithDisplayName = { displayName: string };
type ActivationIndicator = ToolbarFieldProps["ActivationIndicatorComponent"];
type ToolbarFormFieldEmphasis = "uitkEmphasisLow" | "uitkEmphasisMedium";

const NullActivationIndicator = () => null;
const mediumEmphasisControls = ["Dropdown", "Input"];

const getChildElementName = (element: ReactNode): string => {
  if (isValidElement(element)) {
    const { type } = element;
    if (typeof type === "string") {
      return type;
    } else if (typeof type.name === "string") {
      return type.name;
    } else if ("displayName" in type) {
      return (type as TypeWithDisplayName).displayName;
    } else {
      return "";
    }
  } else {
    throw Error(
      "useToolbarField, child of ToolbarField is not valid ReactElememnt"
    );
  }
};

// ToolbarButton gets special styling treatment in the OverflowPanel but styling is
// applied to the FormField, so we need to target those FormFields hosting ToolbarButtons.
const isToolbarButton = (element: ReactElement): boolean =>
  isValidElement(element) && element.type === ToolbarButton;

// Some props for Toolbar FormFields depend on the control hosted by
// the FormField.
export const getToolbarFormFieldProps = (
  child: ReactNode,
  isOverflowPanel = false
): ToolbarFieldProps => {
  let activationIndicator: ActivationIndicator = NullActivationIndicator;
  let emphasis: ToolbarFormFieldEmphasis = "uitkEmphasisLow";
  const element = child as ReactElement;
  if (isValidElement(element)) {
    const name = getChildElementName(element);
    if (mediumEmphasisControls.includes(name)) {
      activationIndicator = undefined;
      emphasis = "uitkEmphasisMedium";
    }
  }
  return {
    ActivationIndicatorComponent: activationIndicator,
    className: cx(emphasis, {
      "uitkFormField-toolbarButton":
        isOverflowPanel && isToolbarButton(element),
    }),
    fullWidth: false,
  };
};

// Eventually this list needs to be configurable at the Toolbar level
const InteractiveComponents = ["Input", "Dropdown"];

export const useToolbarField = (
  props: ToolbarFieldProps
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
    [childElementName, onClick]
  );
  return {
    ActivationIndicatorComponent:
      ActivationIndicatorComponentProp ?? ActivationIndicatorComponent,
    className: cx("uitkToolbarField", classNameProp, className),
    labelPlacement,
    onClick: handleClick,
    ...rest,
    ...calculatedProps,
  };
};
