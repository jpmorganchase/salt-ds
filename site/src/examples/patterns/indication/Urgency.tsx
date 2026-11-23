import { Code, FlexLayout, FlowLayout } from "@salt-ds/core";
import {
  UrgencyHighIcon,
  UrgencyLowIcon,
  UrgencyMediumIcon,
  UrgencyNoneIcon,
} from "@salt-ds/icons";

export const Urgency = () => {
  return (
    <FlowLayout>
      <FlexLayout gap={0.5} align="center">
        <UrgencyNoneIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-content-secondary-foreground)" }}
        />
        <Code>urgency-none</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <UrgencyLowIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-content-accent-foreground)" }}
        />
        <Code>urgency-low</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <UrgencyMediumIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-status-warning-foreground-decorative)" }}
        />
        <Code>urgency-medium</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <UrgencyHighIcon
          aria-hidden
          size={2}
          style={{
            color: "var(--salt-sentiment-negative-foreground-decorative)",
          }}
        />

        <Code>urgency-high</Code>
      </FlexLayout>
    </FlowLayout>
  );
};
