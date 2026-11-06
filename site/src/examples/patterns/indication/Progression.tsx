import { Code, FlexLayout, FlowLayout } from "@salt-ds/core";
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
      <FlexLayout gap={0.5} align="center">
        <ProgressTodoIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-color-gray-500)" }}
        />
        <Code>progress-todo</Code>
      </FlexLayout>

      <FlexLayout gap={0.5} align="center">
        <ProgressDraftIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-color-gray-500)" }}
        />
        <Code>progress-draft</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressOnholdIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-palette-accent)" }}
        />
        <Code>progress-onhold</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressInprogressIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-palette-accent)" }}
        />
        <Code>progress-inprogress</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressPendingIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-color-orange-500)" }}
        />
        <Code>progress-pending</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressCancelledIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-color-red-500)" }}
        />
        <Code>progress-cancelled</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressRejectedIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-color-red-500)" }}
        />
        <Code>progress-rejected</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressCompleteIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-color-green-500)" }}
        />
        <Code>progress-complete</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressClosedIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-color-green-500)" }}
        />
        <Code>progress-closed</Code>
      </FlexLayout>
    </FlowLayout>
  );
};
