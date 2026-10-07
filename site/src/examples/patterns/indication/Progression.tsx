import { FlowLayout } from "@salt-ds/core";
import {
  ProgressCancelledIcon,
  ProgressClosedIcon,
  ProgressCompleteIcon,
  ProgressDraftIcon,
  ProgressInprogressIcon,
  ProgressOnholdIcon,
  ProgressPendingIcon,
  ProgressRejectedIcon,
  ProgressTodoIcon,
} from "@salt-ds/icons";

export const Progression = () => {
  return (
    <FlowLayout>
      <ProgressTodoIcon
        size={2}
        style={{ color: "var(--salt-color-gray-500)" }}
      />
      <ProgressDraftIcon
        size={2}
        style={{ color: "var(--salt-color-gray-500)" }}
      />
      <ProgressOnholdIcon
        size={2}
        style={{ color: "var(--salt-palette-accent)" }}
      />
      <ProgressInprogressIcon
        size={2}
        style={{ color: "var(--salt-palette-accent)" }}
      />
      <ProgressPendingIcon
        size={2}
        style={{ color: "var(--salt-color-orange-500)" }}
      />
      <ProgressCancelledIcon
        size={2}
        style={{ color: "var(--salt-color-red-500)" }}
      />
      <ProgressRejectedIcon
        size={2}
        style={{ color: "var(--salt-color-red-500)" }}
      />
      <ProgressCompleteIcon
        size={2}
        style={{ color: "var(--salt-color-green-500)" }}
      />
      <ProgressClosedIcon
        size={2}
        style={{ color: "var(--salt-color-green-500)" }}
      />
    </FlowLayout>
  );
};
