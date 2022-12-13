import { createContext, ComponentType, useContext, useDebugValue } from "react";
import { Tooltip as UITKTooltip, TooltipProps } from "./Tooltip";
import { UseTooltipProps } from "./useTooltip";

// TODO see also below. what is the intention od the context.toolTip - that users can supply
// a component or an element
export interface TooltipContextProps {
  // TODO: We should relax the constraint of prop so that custom Tooltip conforming to a simpler API will work
  Tooltip?: ComponentType<TooltipProps>;
  enterDelay?: number;
  leaveDelay?: number;
  placement?: UseTooltipProps["placement"];
}

export const TooltipContext = createContext<TooltipContextProps | undefined>(
  undefined
);

/**
 * TODO: Probably move this to Tooltip packages so it can be reused?
 *
 * Provide defaults for Tooltip config so that we can maintain the consistency
 * if no customized override is provided
 */
export const useTooltipContext = () => {
  const context: TooltipContextProps = useContext(TooltipContext) || {};

  useDebugValue(
    `${
      context && context.Tooltip !== undefined
        ? "Customized"
        : "Default UIToolkit"
    } Tooltip.`
  );

  // TODO what is the intention od the context.toolTip - that users can supply
  // a component or an element
  return {
    Tooltip: /* context.Tooltip ||*/ UITKTooltip,
    enterDelay: context.enterDelay || 1500,
    leaveDelay: context.leaveDelay || 0,
    placement: context.placement || "top",
  };
};
