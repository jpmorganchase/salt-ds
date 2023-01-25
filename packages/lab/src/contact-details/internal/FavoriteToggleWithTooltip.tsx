import { forwardRef } from "react";
import { FavoriteToggle, FavoriteToggleProps } from "./FavoriteToggle";
import { Tooltip, TooltipProps } from "../../tooltip";

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
      <FavoriteToggle {...restProps} ref={ref} />
    </Tooltip>
  );
});
