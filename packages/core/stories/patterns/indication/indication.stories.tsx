import { Button, FlowLayout } from "@salt-ds/core";
import {
  ErrorIcon,
  InfoIcon,
  ProgressCancelledIcon,
  ProgressClosedIcon,
  ProgressCompleteIcon,
  ProgressDraftIcon,
  ProgressInprogressIcon,
  ProgressOnholdIcon,
  ProgressPendingIcon,
  ProgressRejectedIcon,
  ProgressTodoIcon,
  SuccessCircleIcon,
  UrgencyHighIcon,
  UrgencyLowIcon,
  UrgencyMediumIcon,
  UrgencyNoneIcon,
  WarningIcon,
} from "@salt-ds/icons";
import type { Meta } from "@storybook/react";

export default {
  title: "Patterns/Indication",
} as Meta;

export const Status = () => {
  return (
    <FlowLayout>
      <InfoIcon size={2} style={{ color: "var(--salt-color-blue-500)" }} />
      <WarningIcon size={2} style={{ color: "var(--salt-color-orange-500)" }} />
      <ErrorIcon size={2} style={{ color: "var(--salt-color-red-500)" }} />
      <SuccessCircleIcon
        size={2}
        style={{ color: "var(--salt-color-blue-500)" }}
      />
    </FlowLayout>
  );
};

export const Sentiment = () => {
  return (
    <FlowLayout>
      <Button sentiment="neutral">Neutral</Button>
      <Button sentiment="accented">Accented</Button>
      <Button sentiment="caution">Caution</Button>
      <Button sentiment="negative">Negative</Button>
      <Button sentiment="positive">Positive</Button>
    </FlowLayout>
  );
};

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

export const Urgency = () => {
  return (
    <FlowLayout>
      <UrgencyNoneIcon
        size={2}
        style={{ color: "var(--salt-color-gray-500)" }}
      />
      <UrgencyLowIcon
        size={2}
        style={{ color: "var(--salt-palette-accent)" }}
      />
      <UrgencyMediumIcon
        size={2}
        style={{ color: "var(--salt-color-orange-500)" }}
      />
      <UrgencyHighIcon
        size={2}
        style={{ color: "var(--salt-color-red-500)" }}
      />
    </FlowLayout>
  );
};
