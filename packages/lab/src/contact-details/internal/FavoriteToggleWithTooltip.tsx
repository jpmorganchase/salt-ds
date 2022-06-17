import {
  Tooltip,
  TooltipProps,
  useForkRef,
  useTooltip,
} from "@jpmorganchase/uitk-core";
import { forwardRef } from "react";
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

  const { getTooltipProps, getTriggerProps } = useTooltip({
    enterDelay: 1500,
    placement: "bottom",
  });

  const { ref: triggerRef, ...triggerProps } =
    getTriggerProps<typeof FavoriteToggle>(restProps);

  const handleRef = useForkRef(triggerRef, ref);

  return (
    <>
      <Tooltip {...getTooltipProps({ title: tooltipTitle, ...tooltipProps })} />
      <FavoriteToggle {...triggerProps} ref={handleRef} />
    </>
  );
});
