import { Button, NavigationItem, StackLayout, Tag } from "@salt-ds/core";
import { NotificationIcon } from "@salt-ds/icons";
import {
  MegaMenu,
  MegaMenuContainer,
  MegaMenuGroup,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import { useState } from "react";

import "./mega-menu.stories.css";

export default {
  title: "Lab/Mega Menu",
  parameters: {
    layout: "padded",
  },
  component: MegaMenuContainer,
};

const DefaultTemplate: StoryFn = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MegaMenu open={isOpen} onOpenChange={setIsOpen}>
      <div style={{ width: "100%" }}>
        <MegaMenuTrigger>
          <Button onClick={() => setIsOpen(true)}>Open Mega Menu</Button>
        </MegaMenuTrigger>

        <MegaMenuContainer>
          <MegaMenuGroup>
            <MegaMenuHeader>Menu Header 1</MegaMenuHeader>
            <MegaMenuItem>Mega menu item 1</MegaMenuItem>
            <MegaMenuItem>Mega menu item 2</MegaMenuItem>
            <MegaMenuItem>Mega menu item 3</MegaMenuItem>
            <MegaMenuItem>Mega menu item 4</MegaMenuItem>
            <MegaMenuItem>Mega menu item 5</MegaMenuItem>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuHeader>Menu Header 1</MegaMenuHeader>
            <MegaMenuItem>Mega menu item 1</MegaMenuItem>
            <MegaMenuItem>Mega menu item 2</MegaMenuItem>
            <MegaMenuItem>Mega menu item 3</MegaMenuItem>
            <MegaMenuItem>Mega menu item 4</MegaMenuItem>
            <MegaMenuItem>Mega menu item 5</MegaMenuItem>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuHeader>Menu Header 1</MegaMenuHeader>
            <MegaMenuItem>Mega menu item 1</MegaMenuItem>
            <MegaMenuItem>Mega menu item 2</MegaMenuItem>
            <MegaMenuItem>Mega menu item 3</MegaMenuItem>
            <MegaMenuItem>Mega menu item 4</MegaMenuItem>
            <MegaMenuItem>Mega menu item 5</MegaMenuItem>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuHeader>Menu Header 1</MegaMenuHeader>
            <MegaMenuItem>Mega menu item 1</MegaMenuItem>
            <MegaMenuItem>Mega menu item 2</MegaMenuItem>
            <MegaMenuItem>Mega menu item 3</MegaMenuItem>
            <MegaMenuItem>Mega menu item 4</MegaMenuItem>
            <MegaMenuItem>Mega menu item 5</MegaMenuItem>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuHeader>Menu Header 1</MegaMenuHeader>
            <MegaMenuItem>Mega menu item 1</MegaMenuItem>
            <MegaMenuItem>Mega menu item 2</MegaMenuItem>
            <MegaMenuItem>Mega menu item 3</MegaMenuItem>
            <MegaMenuItem>Mega menu item 4</MegaMenuItem>
            <MegaMenuItem>Mega menu item 5</MegaMenuItem>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuHeader>Menu Header 1</MegaMenuHeader>
            <MegaMenuItem>Mega menu item 1</MegaMenuItem>
            <MegaMenuItem>Mega menu item 2</MegaMenuItem>
            <MegaMenuItem>Mega menu item 3</MegaMenuItem>
            <MegaMenuItem>Mega menu item 4</MegaMenuItem>
            <MegaMenuItem>Mega menu item 5</MegaMenuItem>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuHeader>Menu Header 1</MegaMenuHeader>
            <MegaMenuItem>Mega menu item 1</MegaMenuItem>
            <MegaMenuItem>Mega menu item 2</MegaMenuItem>
            <MegaMenuItem>Mega menu item 3</MegaMenuItem>
            <MegaMenuItem>Mega menu item 4</MegaMenuItem>
            <MegaMenuItem>Mega menu item 5</MegaMenuItem>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuHeader>Menu Header 1</MegaMenuHeader>
            <MegaMenuItem>Mega menu item 1</MegaMenuItem>
            <MegaMenuItem>Mega menu item 2</MegaMenuItem>
            <MegaMenuItem>Mega menu item 3</MegaMenuItem>
            <MegaMenuItem>Mega menu item 4</MegaMenuItem>
            <MegaMenuItem>Mega menu item 5</MegaMenuItem>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuHeader>Menu Header 1</MegaMenuHeader>
            <MegaMenuItem>Mega menu item 1</MegaMenuItem>
            <MegaMenuItem>Mega menu item 2</MegaMenuItem>
            <MegaMenuItem>Mega menu item 3</MegaMenuItem>
            <MegaMenuItem>Mega menu item 4</MegaMenuItem>
            <MegaMenuItem>Mega menu item 5</MegaMenuItem>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuHeader>Menu Header 1</MegaMenuHeader>
            <MegaMenuItem>Mega menu item 1</MegaMenuItem>
            <MegaMenuItem>Mega menu item 2</MegaMenuItem>
            <MegaMenuItem>Mega menu item 3</MegaMenuItem>
            <MegaMenuItem>Mega menu item 4</MegaMenuItem>
            <MegaMenuItem>Mega menu item 5</MegaMenuItem>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
            <MegaMenuItem>Mega menu item 1</MegaMenuItem>
            <MegaMenuItem>Mega menu item 2</MegaMenuItem>
            <MegaMenuItem>Mega menu item 3</MegaMenuItem>
            <MegaMenuItem>Mega menu item 4</MegaMenuItem>
            <MegaMenuItem>Mega menu item 5</MegaMenuItem>
          </MegaMenuGroup>
        </MegaMenuContainer>
      </div>
    </MegaMenu>
  );
};

export const Default = DefaultTemplate.bind({});

const WithIconsTemplate: StoryFn = () => {
  return (
    <MegaMenu>
      <MegaMenuTrigger>
        <Button>Open Mega Menu</Button>
      </MegaMenuTrigger>
      <MegaMenuContainer>
        <MegaMenuGroup>
          <MegaMenuHeader>Menu Header</MegaMenuHeader>
          <MegaMenuItem>
            <NotificationIcon aria-hidden />
            Mega menu item
            <Tag>New</Tag>
          </MegaMenuItem>
          <MegaMenuItem>
            <NotificationIcon aria-hidden />
            Mega menu item
            <Tag>New</Tag>
          </MegaMenuItem>
          <MegaMenuItem>
            <NotificationIcon aria-hidden />
            Mega menu item
            <Tag>New</Tag>
          </MegaMenuItem>
        </MegaMenuGroup>
      </MegaMenuContainer>
    </MegaMenu>
  );
};

export const WithIcons = WithIconsTemplate.bind({});

const WithNavigationItemsTemplate: StoryFn = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MegaMenu open={isOpen} onOpenChange={setIsOpen}>
      <nav>
        <StackLayout as="ul" direction="row" gap={1}>
          <li>
            <MegaMenuTrigger>
              <NavigationItem
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setIsOpen(true);
                }}
              >
                Products
              </NavigationItem>
            </MegaMenuTrigger>
          </li>
          <li>
            <MegaMenuTrigger>
              <NavigationItem
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setIsOpen(true);
                }}
              >
                Solutions
              </NavigationItem>
            </MegaMenuTrigger>
          </li>
          <li>
            <MegaMenuTrigger>
              <NavigationItem
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setIsOpen(true);
                }}
              >
                Resources
              </NavigationItem>
            </MegaMenuTrigger>
          </li>
        </StackLayout>
      </nav>

      <MegaMenuContainer>
        <MegaMenuGroup>
          <MegaMenuHeader>Menu Header 1</MegaMenuHeader>
          <MegaMenuItem>Mega menu item 1</MegaMenuItem>
          <MegaMenuItem>Mega menu item 2</MegaMenuItem>
          <MegaMenuItem>Mega menu item 3</MegaMenuItem>
        </MegaMenuGroup>
        <MegaMenuGroup>
          <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
          <MegaMenuItem>Mega menu item 4</MegaMenuItem>
          <MegaMenuItem>Mega menu item 5</MegaMenuItem>
          <MegaMenuItem>Mega menu item 6</MegaMenuItem>
        </MegaMenuGroup>
        <MegaMenuGroup>
          <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
          <MegaMenuItem>Mega menu item 7</MegaMenuItem>
          <MegaMenuItem>Mega menu item 8</MegaMenuItem>
          <MegaMenuItem>Mega menu item 9</MegaMenuItem>
        </MegaMenuGroup>
      </MegaMenuContainer>
    </MegaMenu>
  );
};

export const WithNavigationItems = WithNavigationItemsTemplate.bind({});

const TriggerPositionTemplate: StoryFn = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MegaMenu open={isOpen} onOpenChange={setIsOpen}>
      <div style={{ width: "100%", display: "grid", gap: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            paddingLeft: "12px",
          }}
        >
          <MegaMenuTrigger>
            <Button onClick={() => setIsOpen(true)}>Near Left Edge</Button>
          </MegaMenuTrigger>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <MegaMenuTrigger>
            <Button onClick={() => setIsOpen(true)}>On Center</Button>
          </MegaMenuTrigger>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingLeft: "180px",
          }}
        >
          <MegaMenuTrigger>
            <Button onClick={() => setIsOpen(true)}>Slightly Offset</Button>
          </MegaMenuTrigger>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingRight: "12px",
          }}
        >
          <MegaMenuTrigger>
            <Button onClick={() => setIsOpen(true)}>Near The Edge</Button>
          </MegaMenuTrigger>
        </div>
      </div>

      <MegaMenuContainer>
        <MegaMenuGroup>
          <MegaMenuHeader>Menu Header 1</MegaMenuHeader>
          <MegaMenuItem>Mega menu item 1</MegaMenuItem>
          <MegaMenuItem>Mega menu item 2</MegaMenuItem>
          <MegaMenuItem>Mega menu item 3</MegaMenuItem>
        </MegaMenuGroup>
        <MegaMenuGroup>
          <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
          <MegaMenuItem>Mega menu item 4</MegaMenuItem>
          <MegaMenuItem>Mega menu item 5</MegaMenuItem>
          <MegaMenuItem>Mega menu item 6</MegaMenuItem>
        </MegaMenuGroup>
        <MegaMenuGroup>
          <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
          <MegaMenuItem>Mega menu item 7</MegaMenuItem>
          <MegaMenuItem>Mega menu item 8</MegaMenuItem>
          <MegaMenuItem>Mega menu item 9</MegaMenuItem>
        </MegaMenuGroup>
        <MegaMenuGroup>
          <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
          <MegaMenuItem>Mega menu item 10</MegaMenuItem>
          <MegaMenuItem>Mega menu item 11</MegaMenuItem>
          <MegaMenuItem>Mega menu item 12</MegaMenuItem>
        </MegaMenuGroup>
        {/* <MegaMenuGroup>
          <MegaMenuHeader>Menu Header 5</MegaMenuHeader>
          <MegaMenuItem>Mega menu item 13</MegaMenuItem>
          <MegaMenuItem>Mega menu item 14</MegaMenuItem>
          <MegaMenuItem>Mega menu item 15</MegaMenuItem>
        </MegaMenuGroup>
        <MegaMenuGroup>
          <MegaMenuHeader>Menu Header 6</MegaMenuHeader>
          <MegaMenuItem>Mega menu item 16</MegaMenuItem>
          <MegaMenuItem>Mega menu item 17</MegaMenuItem>
          <MegaMenuItem>Mega menu item 18</MegaMenuItem>
        </MegaMenuGroup>
        <MegaMenuGroup>
          <MegaMenuHeader>Menu Header 7</MegaMenuHeader>
          <MegaMenuItem>Mega menu item 19</MegaMenuItem>
          <MegaMenuItem>Mega menu item 20</MegaMenuItem>
          <MegaMenuItem>Mega menu item 21</MegaMenuItem>
        </MegaMenuGroup> */}
      </MegaMenuContainer>
    </MegaMenu>
  );
};

export const TriggerPosition = TriggerPositionTemplate.bind({});

const FullWidthContainerTemplate: StoryFn = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MegaMenu open={isOpen} onOpenChange={setIsOpen}>
      <MegaMenuTrigger>
        <Button onClick={() => setIsOpen(true)}>
          Open Full Width Mega Menu
        </Button>
      </MegaMenuTrigger>

      <MegaMenuContainer
        style={{ width: "100vw", maxWidth: "100vw", boxSizing: "border-box" }}
      >
        <MegaMenuGroup>
          <MegaMenuHeader>Products</MegaMenuHeader>
          <MegaMenuItem>Analytics Workspace</MegaMenuItem>
          <MegaMenuItem>Order Management</MegaMenuItem>
          <MegaMenuItem>Pricing Configurator</MegaMenuItem>
        </MegaMenuGroup>
        <MegaMenuGroup>
          <MegaMenuHeader>Solutions</MegaMenuHeader>
          <MegaMenuItem>Risk Monitoring</MegaMenuItem>
          <MegaMenuItem>Client Reporting</MegaMenuItem>
          <MegaMenuItem>Trade Automation</MegaMenuItem>
        </MegaMenuGroup>
        <MegaMenuGroup>
          <MegaMenuHeader>Resources</MegaMenuHeader>
          <MegaMenuItem>Documentation</MegaMenuItem>
          <MegaMenuItem>Release Notes</MegaMenuItem>
          <MegaMenuItem>Developer API</MegaMenuItem>
        </MegaMenuGroup>
      </MegaMenuContainer>
    </MegaMenu>
  );
};

export const FullWidthContainer = FullWidthContainerTemplate.bind({});

FullWidthContainer.parameters = {
  layout: "fullscreen",
};
