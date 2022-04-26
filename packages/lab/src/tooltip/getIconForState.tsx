import {
  ErrorIcon,
  SuccessTickIcon,
  WarningIcon,
} from "@jpmorganchase/uitk-icons";
import { IconProps } from "@jpmorganchase/uitk-core";
import { TooltipState } from "./Tooltip";

export const State = {
  error: "error",
  success: "success",
  warning: "warning",
};

const icons = {
  // No icon for Notify state
  [State.error]: ErrorIcon,
  [State.success]: SuccessTickIcon,
  [State.warning]: WarningIcon,
};

export function getIconForState(state: TooltipState) {
  const StateIcon = (props: IconProps) => {
    const StateIcon = icons[state];
    if (StateIcon) {
      return <StateIcon {...props} />;
    } else {
      return null;
    }
  };
  return state ? StateIcon : null;
}
