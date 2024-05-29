import { Tag } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import { NotificationIcon } from "@salt-ds/icons";

export default {
  title: "Lab/Tag/QA",
  component: Tag,
} as Meta<typeof Tag>;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer cols={4} height={300} itemPadding={1} width={1200} {...props}>
      <Tag>Primary Tag</Tag>
      <Tag variant="secondary">Secondary Tag</Tag>
      <Tag variant="tertiary">Tertiary Tag</Tag>
      <Tag>
        <NotificationIcon /> With Icon Tag
      </Tag>
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
