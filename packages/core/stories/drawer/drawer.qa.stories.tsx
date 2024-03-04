import { H2, Text, StackLayout, Drawer, DrawerProps } from "@salt-ds/core";
import { StoryFn, Meta } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Core/Drawer/Drawer QA",
  component: Drawer,
} as Meta<typeof Drawer>;

function FakeDrawer({ children, ...rest }: DrawerProps) {
  return (
    <div
      style={{
        width: 350,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

const DrawerTemplate: StoryFn<typeof Drawer> = () => {
  return (
    <StackLayout>
      <FakeDrawer>
        <H2>Title</H2>
        <Text>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum
        </Text>
      </FakeDrawer>
    </StackLayout>
  );
};

export const DrawerExamples: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;

  return (
    <QAContainer height={2000} itemPadding={20} width={1000} {...rest}>
      <DrawerTemplate />
    </QAContainer>
  );
};
DrawerExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
