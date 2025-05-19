import { FlowLayout, NavigationItem, StackLayout } from "@salt-ds/core";
import { NotificationIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Navigation Item/Navigation Item QA",
  component: NavigationItem,
} as Meta;

export const AllExamples: StoryFn<QAContainerProps> = () => (
  <>
    <QAContainer
      height={1210}
      width={1630}
      itemWidthAuto
      vertical
      transposeDensity
    >
      <FlowLayout gap={1} style={{ alignItems: "flex-start", maxWidth: 800 }}>
        <NavigationItem>Button</NavigationItem>
        <NavigationItem href="#">Link</NavigationItem>
        <NavigationItem active>Active</NavigationItem>
        <NavigationItem blurActive>Blur active</NavigationItem>
        <NavigationItem parent>Horizontal Parent</NavigationItem>
        <NavigationItem parent expanded>
          Horizontal Parent expanded
        </NavigationItem>
        <NavigationItem parent href="#">
          Horizontal Parent Link
        </NavigationItem>
        <NavigationItem orientation="vertical">Vertical</NavigationItem>
        <NavigationItem orientation="vertical" parent>
          Vertical Parent
        </NavigationItem>
        <NavigationItem orientation="vertical" parent expanded>
          Vertical Parent expanded
        </NavigationItem>
      </FlowLayout>
      <FlowLayout>
        <StackLayout gap="var(--salt-size-border">
          <NavigationItem orientation="vertical" level={0}>
            Level 0
          </NavigationItem>
          <NavigationItem orientation="vertical" level={1}>
            Level 1
          </NavigationItem>
          <NavigationItem orientation="vertical" level={2}>
            Level 2
          </NavigationItem>
          <NavigationItem orientation="vertical" level={3}>
            Level 3
          </NavigationItem>
        </StackLayout>
        <StackLayout gap="var(--salt-size-border">
          <NavigationItem orientation="vertical" level={0}>
            <NotificationIcon />
            Level 0
          </NavigationItem>
          <NavigationItem orientation="vertical" level={1}>
            <NotificationIcon />
            Level 1
          </NavigationItem>
          <NavigationItem orientation="vertical" level={2}>
            <NotificationIcon />
            Level 2
          </NavigationItem>
          <NavigationItem orientation="vertical" level={3}>
            <NotificationIcon />
            Level 3
          </NavigationItem>
        </StackLayout>
        <StackLayout gap="var(--salt-size-border">
          <NavigationItem orientation="vertical" level={0} parent expanded>
            <NotificationIcon />
            Level 0 with icon
          </NavigationItem>
          <NavigationItem orientation="vertical" level={1}>
            Level 1
          </NavigationItem>
          <NavigationItem orientation="vertical" level={2}>
            Level 2
          </NavigationItem>
          <NavigationItem orientation="vertical" level={0} parent blurActive>
            <NotificationIcon />
            Level 0 with icon
          </NavigationItem>
        </StackLayout>
      </FlowLayout>
    </QAContainer>
  </>
);

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
