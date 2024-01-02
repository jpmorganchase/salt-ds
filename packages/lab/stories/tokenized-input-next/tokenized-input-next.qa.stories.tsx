import { Meta, StoryFn } from "@storybook/react";
import { TokenizedInputNext } from "@salt-ds/lab";
import { QAContainer, QAContainerProps } from "docs/components";
import "docs/story.css";

export default {
  title: "Lab/Tokenized Input Next/QA",
  component: TokenizedInputNext,
} as Meta<typeof TokenizedInputNext>;

export const QA: StoryFn<QAContainerProps> = () => (
  <QAContainer height={500} width={1000} itemPadding={4}>
    <TokenizedInputNext />
    <TokenizedInputNext defaultSelected={["Mexico City"]} />
    <TokenizedInputNext readOnly defaultSelected={["Read only value"]} />
    <TokenizedInputNext disabled defaultSelected={["Disabled value"]} />
    <TokenizedInputNext
      defaultSelected={["Secondary value"]}
      variant="secondary"
    />
    <TokenizedInputNext
      defaultSelected={["Error value"]}
      validationStatus="error"
    />
    <TokenizedInputNext
      defaultSelected={["Warning value"]}
      validationStatus="warning"
    />
    <TokenizedInputNext
      defaultSelected={["Success value"]}
      validationStatus="success"
    />
    <TokenizedInputNext
      defaultSelected={["Cairo", "Mumbai", "Beijing", "Mexico City"]}
    />
  </QAContainer>
);
