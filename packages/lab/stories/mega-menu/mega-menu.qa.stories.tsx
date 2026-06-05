import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuBody,
  MegaMenuGroup,
  MegaMenuGroupHeading,
  MegaMenuItem,
  MegaMenuItemList,
  MegaMenuPanel,
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
              <MegaMenuBody>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Group</MegaMenuGroupHeading>
                  <MegaMenuItemList>
                    <MegaMenuItem href="#">Item</MegaMenuItem>
                  </MegaMenuItemList>
                </MegaMenuGroup>
              </MegaMenuBody>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu defaultOpen>
            <MegaMenuTrigger>
              <NavigationItem>Services</NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuPanel aria-label="Services menu">
              <MegaMenuBody>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Group</MegaMenuGroupHeading>
                  <MegaMenuItemList>
                    <MegaMenuItem href="#">Item</MegaMenuItem>
                  </MegaMenuItemList>
                </MegaMenuGroup>
              </MegaMenuBody>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu>
            <MegaMenuTrigger>
              <NavigationItem>Resources</NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuPanel aria-label="Resources menu">
              <MegaMenuBody>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Group</MegaMenuGroupHeading>
                  <MegaMenuItemList>
                    <MegaMenuItem href="#">Item</MegaMenuItem>
                  </MegaMenuItemList>
                </MegaMenuGroup>
              </MegaMenuBody>
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
