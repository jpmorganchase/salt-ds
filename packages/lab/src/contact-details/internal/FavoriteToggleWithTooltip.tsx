import { forwardRef } from "react";
import { Tooltip, TooltipProps } from "@salt-ds/core";
import { FavoriteToggle, FavoriteToggleProps } from "./FavoriteToggle";

export interface FavoriteToggleWithTooltipProps extends FavoriteToggleProps {
  tooltipProps?: TooltipProps;
  tooltipTitle?: string;
}

export const FavoriteToggleWithTooltip = forwardRef<
  HTMLSpanElement,
  FavoriteToggleWithTooltipProps
>(function FavoriteToggleWithTooltip(props, ref) {
  const {
    tooltipTitle = "Toggle favorite",
    tooltipProps,
    ...restProps
  } = props;

  return (
    <Tooltip enterDelay={1500} placement="bottom" content={tooltipTitle}>
      <FavoriteToggle ref={ref} {...restProps} />
    </Tooltip>
  );
});
