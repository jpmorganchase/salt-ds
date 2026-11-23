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
          style={{ color: "var(--salt-content-secondary-foreground)" }}
        />
        <Code>progress-todo</Code>
      </FlexLayout>

      <FlexLayout gap={0.5} align="center">
        <ProgressDraftIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-content-secondary-foreground)" }}
        />
        <Code>progress-draft</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressOnholdIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-content-accent-foreground)" }}
        />
        <Code>progress-onhold</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressInprogressIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-content-accent-foreground)" }}
        />
        <Code>progress-inprogress</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressPendingIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-status-warning-foreground-decorative)" }}
        />
        <Code>progress-pending</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressCancelledIcon
          aria-hidden
          size={2}
          style={{
            color: "var(--salt-sentiment-negative-foreground-decorative)",
          }}
        />
        <Code>progress-cancelled</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressRejectedIcon
          aria-hidden
          size={2}
          style={{
            color: "var(--salt-sentiment-negative-foreground-decorative)",
          }}
        />
        <Code>progress-rejected</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressCompleteIcon
          aria-hidden
          size={2}
          style={{
            color: "var(--salt-sentiment-positive-foreground-decorative)",
          }}
        />
        <Code>progress-complete</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ProgressClosedIcon
          aria-hidden
          size={2}
          style={{
            color: "var(--salt-sentiment-positive-foreground-decorative)",
          }}
        />
        <Code>progress-closed</Code>
      </FlexLayout>
    </FlowLayout>
  );
};
