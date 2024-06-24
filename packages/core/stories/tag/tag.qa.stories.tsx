import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import { NotificationIcon } from "@salt-ds/icons";
import { Tag, FlexLayout } from "@salt-ds/core";

export default {
  title: "Core/Tag/QA",
  component: Tag,
} as Meta<typeof Tag>;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer cols={2} height={1800} itemPadding={1} width={2000} {...props}>
      {Array.from({ length: 20 }, (_, index) => (
        <FlexLayout gap={1} key={index}>
          <Tag category={index + 1}>Primary</Tag>
          <Tag category={index + 1}>
            <NotificationIcon /> With Icon
          </Tag>

          <Tag category={index + 1} bordered>
            Bordered
          </Tag>
          <Tag category={index + 1} variant="secondary">
            Secondary
          </Tag>
        </FlexLayout>
      ))}
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
