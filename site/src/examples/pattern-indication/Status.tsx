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
        <InfoIcon size={2} style={{ color: "var(--salt-color-blue-500)" }} />
        <Code>info</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <WarningIcon
          size={2}
          style={{ color: "var(--salt-color-orange-500)" }}
        />
        <Code>warning</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <ErrorIcon size={2} style={{ color: "var(--salt-color-red-500)" }} />
        <Code>error</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <SuccessCircleIcon
          size={2}
          style={{ color: "var(--salt-color-blue-500)" }}
        />

        <Code>success-circle</Code>
      </FlexLayout>
    </FlowLayout>
  );
};
