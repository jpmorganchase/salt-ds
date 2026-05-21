import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  type SidePanelProps,
  SidePanelProvider,
  SidePanelTitle,
  StackLayout,
  Text,
} from "@salt-ds/core";

import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import type { ReactNode } from "react";

export default {
  title: "Core/Side Panel/Side Panel QA",
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

const loremText =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.";

const SidePanelTemplate: StoryFn<SidePanelProps> = ({
  variant = "primary",
  position = "right",
}) => {
  return (
    <div style={{ width: 350, display: "flex" }}>
      <FakeSidePanel variant={variant} position={position}>
        <SidePanelHeader>
          <SidePanelTitle>Title</SidePanelTitle>
        </SidePanelHeader>
        <SidePanelContent>
          <Text>{loremText}</Text>
        </SidePanelContent>
      </FakeSidePanel>
    </div>
  );
};

export const OpenLeft: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;

  return (
    <QAContainer
      cols={2}
      height={"auto"}
      itemPadding={20}
      itemWidthAuto
      width={1200}
      transposeDensity
      {...rest}
    >
      <SidePanelTemplate variant="primary" position="left" />
      <SidePanelTemplate variant="secondary" position="left" />
      <SidePanelTemplate variant="tertiary" position="left" />
      <SidePanelTemplate variant="none" position="left" />
    </QAContainer>
  );
};

OpenLeft.parameters = {
  chromatic: { disableSnapshot: false },
  actions: { disable: true },
};

export const OpenRight: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;

  return (
    <QAContainer
      cols={2}
      height={"auto"}
      itemPadding={20}
      itemWidthAuto
      width={1200}
      transposeDensity
      {...rest}
    >
      <SidePanelTemplate variant="primary" position="right" />
      <SidePanelTemplate variant="secondary" position="right" />
      <SidePanelTemplate variant="tertiary" position="right" />
      <SidePanelTemplate variant="none" position="right" />
    </QAContainer>
  );
};

OpenRight.parameters = {
  chromatic: { disableSnapshot: false },
  actions: { disable: true },
};

export const CustomTitle: StoryFn = () => (
  <div style={{ width: 350, height: 320, display: "flex" }}>
    <FakeSidePanel>
      <SidePanelHeader>
        <SidePanelTitle styleAs="h3">Custom H3 Title</SidePanelTitle>
      </SidePanelHeader>
      <SidePanelContent>
        <Text>{loremText}</Text>
      </SidePanelContent>
    </FakeSidePanel>
  </div>
);

CustomTitle.parameters = {
  chromatic: { disableSnapshot: false },
};

export const ScrollableContent: StoryFn = () => (
  <div style={{ width: 350, height: 250, display: "flex" }}>
    <FakeSidePanel>
      <SidePanelHeader>
        <SidePanelTitle>Scrollable</SidePanelTitle>
      </SidePanelHeader>
      <SidePanelContent>
        <StackLayout>
          {Array.from({ length: 10 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static list of identical placeholder items
            <Text key={i}>
              Paragraph {i + 1}: {loremText}
            </Text>
          ))}
        </StackLayout>
      </SidePanelContent>
    </FakeSidePanel>
  </div>
);

ScrollableContent.parameters = {
  chromatic: { disableSnapshot: false },
};
