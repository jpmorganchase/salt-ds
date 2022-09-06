import {
  ErrorIcon,
  IconProps,
  InfoIcon,
  SuccessTickIcon,
  WarningIcon,
} from "@jpmorganchase/uitk-icons";
import { TooltipState } from "@jpmorganchase/uitk-core";

export const State = {
  error: "error",
  success: "success",
  warning: "warning",
  info: "info",
};

const icons = {
  // No icon for Notify state
  [State.error]: ErrorIcon,
  [State.success]: SuccessTickIcon,
  [State.warning]: WarningIcon,
  [State.info]: InfoIcon,
};

export function getIconForState(state: TooltipState) {
  return (props: IconProps) => {
    const StateIcon = icons[state];
    if (StateIcon) {
      return <StateIcon {...props} />;
    } else {
      return null;
    }
  };
}
