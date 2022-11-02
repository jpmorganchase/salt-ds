import {
  ErrorSolidIcon,
  IconProps,
  SuccessTickIcon,
  WarningSolidIcon,
} from "@jpmorganchase/uitk-icons";
import { TooltipStatus } from "./Tooltip";

export const Status = {
  error: "error",
  success: "success",
  warning: "warning",
};

const icons = {
  // No icon for Notify status
  [Status.error]: ErrorSolidIcon,
  [Status.success]: SuccessTickIcon,
  [Status.warning]: WarningSolidIcon,
};

export function getIconForStatus(status: TooltipStatus) {
  const StatusIcon = (props: IconProps) => {
    const StatusIcon = icons[status];
    if (StatusIcon) {
      return <StatusIcon {...props} />;
    } else {
      return null;
    }
  };
  return status ? StatusIcon : null;
}
