import { Code, FlexLayout, FlowLayout, useTheme } from "@salt-ds/core";
import {
  UrgencyHighIcon,
  UrgencyLowIcon,
  UrgencyMediumIcon,
  UrgencyNoneIcon,
} from "@salt-ds/icons";

export const Urgency = () => {
  const { themeNext } = useTheme();

  return (
    <FlowLayout>
      <FlexLayout gap={0.5} align="center">
        <UrgencyNoneIcon
          size={2}
          style={{ color: "var(--salt-color-gray-500)" }}
        />
        <Code>urgency-none</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <UrgencyLowIcon
          size={2}
          style={{
            color: themeNext
              ? "var(--salt-palette-accent)"
              : "var(--salt-color-blue-500)",
          }}
        />
        <Code>urgency-low</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <UrgencyMediumIcon
          size={2}
          style={{ color: "var(--salt-color-orange-500)" }}
        />
        <Code>urgency-medium</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <UrgencyHighIcon
          size={2}
          style={{ color: "var(--salt-color-red-500)" }}
        />

        <Code>urgency-high</Code>
      </FlexLayout>
    </FlowLayout>
  );
};
