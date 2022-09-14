import {
  ErrorIcon,
  IconProps,
  InfoIcon,
  SuccessTickIcon,
  WarningIcon,
} from "@jpmorganchase/uitk-icons";

// Keep in order of preference. First items are used as default

export type BannerState = "error" | "info" | "success" | "warning";

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

export function getIconForState(state: BannerState) {
  return (props: IconProps) => {
    const StateIcon = icons[state];
    if (StateIcon) {
      return <StateIcon {...props} />;
    } else {
      return null;
    }
  };
}
