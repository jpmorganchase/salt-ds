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
    <QAContainer cols={2} height={300} itemPadding={5} width={1200} {...props}>
      {Array.from({ length: 12 }, (_, index) => (
        <>
          <Tag category={index + 1}>
            <NotificationIcon /> With Icon Tag
          </Tag>
          <Tag category={index + 1} variant="secondary">
            Secondary Tag
          </Tag>
          <Tag category={index + 1} bordered>
            Bordered Tag
          </Tag>
        </>
      ))}
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
