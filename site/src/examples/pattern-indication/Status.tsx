import { Code, FlexLayout, FlowLayout, StatusIndicator } from "@salt-ds/core";

export const Status = () => {
  return (
    <FlowLayout>
      <FlexLayout gap={0.5} align="center">
        <StatusIndicator aria-hidden size={2} status="info" />
        <Code>info</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <StatusIndicator aria-hidden size={2} status="warning" />
        <Code>warning</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <StatusIndicator aria-hidden size={2} status="error" />
        <Code>error</Code>
      </FlexLayout>
      <FlexLayout gap={0.5} align="center">
        <StatusIndicator aria-hidden size={2} status="success" />
        <Code>success</Code>
      </FlexLayout>
    </FlowLayout>
  );
};
