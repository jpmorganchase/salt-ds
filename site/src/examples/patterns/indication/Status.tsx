import { Code, FlexLayout, FlowLayout } from "@salt-ds/core";
import {
  ErrorIcon,
  InfoIcon,
  SuccessCircleIcon,
  WarningIcon,
} from "@salt-ds/icons";

export const Status = () => {
  return (
    <FlowLayout>
      <FlexLayout gap={0.5} align="center">
        <InfoIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-color-blue-500)" }}
        />
        <Code>info</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <WarningIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-color-orange-500)" }}
        />
        <Code>warning</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ErrorIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-color-red-500)" }}
        />
        <Code>error</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <SuccessCircleIcon
          aria-hidden
          size={2}
          style={{ color: "var(--salt-color-green-500)" }}
        />
        <Code>success-circle</Code>
      </FlexLayout>
    </FlowLayout>
  );
};
