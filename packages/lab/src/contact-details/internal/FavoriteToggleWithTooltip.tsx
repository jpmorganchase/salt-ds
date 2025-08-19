import { Tooltip, type TooltipProps } from "@salt-ds/core";
import { forwardRef } from "react";
import { FavoriteToggle, type FavoriteToggleProps } from "./FavoriteToggle";

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
    <Tooltip
      enterDelay={1500}
      placement="bottom"
      content={tooltipTitle}
      {...tooltipProps}
    >
      <FavoriteToggle ref={ref} {...restProps} />
    </Tooltip>
  );
});
