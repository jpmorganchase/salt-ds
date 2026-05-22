import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuGroup,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuPanel,
  MegaMenuSection,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Mega Menu/Mega Menu QA",
  component: MegaMenu,
} as Meta;

export const MultipleTriggers: StoryFn<QAContainerProps> = () => (
  <QAContainer vertical itemPadding={180}>
    <nav>
      <StackLayout
        as="ol"
        direction="row"
        gap={1}
        style={{ listStyle: "none", padding: 0 }}
      >
        <li>
          <MegaMenu>
            <MegaMenuTrigger>
              <NavigationItem>Solutions</NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuPanel aria-label="Solutions menu">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Group</MegaMenuHeader>
                  <MegaMenuItem href="#">Item</MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu defaultOpen>
            <MegaMenuTrigger>
              <NavigationItem>Services</NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuPanel aria-label="Services menu">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Group</MegaMenuHeader>
                  <MegaMenuItem href="#">Item</MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu>
            <MegaMenuTrigger>
              <NavigationItem>Resources</NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuPanel aria-label="Resources menu">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Group</MegaMenuHeader>
                  <MegaMenuItem href="#">Item</MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
      </StackLayout>
    </nav>
  </QAContainer>
);
MultipleTriggers.parameters = {
  chromatic: { disableSnapshot: false },
};
