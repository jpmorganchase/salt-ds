import { H2, StackLayout, Text } from "@salt-ds/core";
import { SidePanel, SidePanelGroup, type SidePanelProps } from "@salt-ds/lab";
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
    <SidePanelGroup open>
      <SidePanel variant={variant} position={position}>
        {children}
      </SidePanel>
    </SidePanelGroup>
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

export const SidePanelExamples: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;

  return (
    <QAContainer height={2000} itemPadding={20} width={1000} {...rest}>
      <SidePanelTemplate />
    </QAContainer>
  );
};

export const SidePanelVariants: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;

  return (
    <QAContainer cols={1} height={3200} itemPadding={20} width={1000} {...rest}>
      <SidePanelTemplate variant="primary" />
      <SidePanelTemplate variant="secondary" />
      <SidePanelTemplate variant="tertiary" />
    </QAContainer>
  );
};

SidePanelExamples.parameters = {
  chromatic: { disableSnapshot: false },
};

SidePanelVariants.parameters = {
  chromatic: { disableSnapshot: false },
};
