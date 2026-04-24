import { H2, StackLayout, Text } from "@salt-ds/core";
import {
  SidePanel,
  type SidePanelProps,
  SidePanelProvider,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import type { ReactNode } from "react";

export default {
  title: "Lab/Side Panel/Side Panel QA",
  component: SidePanel,
} as Meta<typeof SidePanel>;

function FakeSidePanel({
  children,
  variant = "primary",
  position = "right",
}: {
  children: ReactNode;
  variant?: SidePanelProps["variant"];
  position?: SidePanelProps["position"];
}) {
  return (
    <SidePanelProvider open>
      <SidePanel variant={variant} position={position}>
        {children}
      </SidePanel>
    </SidePanelProvider>
  );
}

const SidePanelTemplate: StoryFn<SidePanelProps> = ({
  variant = "primary",
  position = "right",
}) => {
  return (
    <div style={{ width: 350, height: 320 }}>
      <FakeSidePanel variant={variant} position={position}>
        <StackLayout>
          <H2>Title</H2>
          <Text>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book.
          </Text>
        </StackLayout>
      </FakeSidePanel>
    </div>
  );
};

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;

  return (
    <QAContainer cols={1} height={3200} itemPadding={20} width={1000} {...rest}>
      <SidePanelTemplate variant="primary" />
      <SidePanelTemplate variant="secondary" />
      <SidePanelTemplate variant="tertiary" />
      <SidePanelTemplate variant="none" />
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
  actions: { disable: true },
};
