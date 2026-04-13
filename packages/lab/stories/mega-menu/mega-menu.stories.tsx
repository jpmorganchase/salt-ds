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
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleOpenChange = (menu: string) => (open: boolean) => {
    setOpenMenu(open ? menu : null);
  };

  return (
    <nav>
      <StackLayout as="ul" direction="row" gap={1}>
        <li>
          <MegaMenu
            open={openMenu === "solutions"}
            onOpenChange={handleOpenChange("solutions")}
          >
            <MegaMenuTrigger>
              <NavigationItem
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setOpenMenu("solutions");
                }}
              >
                Solutions
              </NavigationItem>
            </MegaMenuTrigger>

            <MegaMenuContainer>
              <MegaMenuGroup>
                <MegaMenuHeader>Analytics</MegaMenuHeader>
                <MegaMenuItem>Data Insights</MegaMenuItem>
                <MegaMenuItem>Business Intelligence</MegaMenuItem>
                <MegaMenuItem>Reporting Tools</MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Integration</MegaMenuHeader>
                <MegaMenuItem>API Gateway</MegaMenuItem>
                <MegaMenuItem>Data Pipeline</MegaMenuItem>
                <MegaMenuItem>Event Streaming</MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuContainer>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu
            open={openMenu === "services"}
            onOpenChange={handleOpenChange("services")}
          >
            <MegaMenuTrigger>
              <NavigationItem
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setOpenMenu("services");
                }}
              >
                Services
              </NavigationItem>
            </MegaMenuTrigger>

            <MegaMenuContainer>
              <MegaMenuGroup>
                <MegaMenuHeader>Consulting</MegaMenuHeader>
                <MegaMenuItem>Strategy</MegaMenuItem>
                <MegaMenuItem>Implementation</MegaMenuItem>
                <MegaMenuItem>Migration</MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Support</MegaMenuHeader>
                <MegaMenuItem>Enterprise Support</MegaMenuItem>
                <MegaMenuItem>Training</MegaMenuItem>
                <MegaMenuItem>Managed Services</MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuContainer>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu
            open={openMenu === "resources"}
            onOpenChange={handleOpenChange("resources")}
          >
            <MegaMenuTrigger>
              <NavigationItem
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setOpenMenu("resources");
                }}
              >
                Resources
              </NavigationItem>
            </MegaMenuTrigger>

            <MegaMenuContainer>
              <MegaMenuGroup>
                <MegaMenuHeader>Learn</MegaMenuHeader>
                <MegaMenuItem>Documentation</MegaMenuItem>
                <MegaMenuItem>Tutorials</MegaMenuItem>
                <MegaMenuItem>Webinars</MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Community</MegaMenuHeader>
                <MegaMenuItem>Blog</MegaMenuItem>
                <MegaMenuItem>Forum</MegaMenuItem>
                <MegaMenuItem>Open Source</MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuContainer>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu
            open={openMenu === "company"}
            onOpenChange={handleOpenChange("company")}
          >
            <MegaMenuTrigger>
              <NavigationItem
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setOpenMenu("company");
                }}
              >
                Company
              </NavigationItem>
            </MegaMenuTrigger>

            <MegaMenuContainer>
              <MegaMenuGroup>
                <MegaMenuHeader>About</MegaMenuHeader>
                <MegaMenuItem>Our Story</MegaMenuItem>
                <MegaMenuItem>Leadership</MegaMenuItem>
                <MegaMenuItem>Careers</MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Contact</MegaMenuHeader>
                <MegaMenuItem>Sales</MegaMenuItem>
                <MegaMenuItem>Partners</MegaMenuItem>
                <MegaMenuItem>Press</MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuContainer>
          </MegaMenu>
        </li>
      </StackLayout>
    </nav>
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

const TabNavigationTemplate: StoryFn = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Button>Button Before Menu</Button>
      <div style={{ marginTop: "20px" }}>
        <MegaMenu>
          <div style={{ width: "100%" }}>
            <MegaMenuTrigger>
              <Button>Open Mega Menu (Test Tab Navigation)</Button>
            </MegaMenuTrigger>

            <MegaMenuContainer>
              <MegaMenuGroup>
                <MegaMenuHeader>Products</MegaMenuHeader>
                <MegaMenuItem>Analytics Platform</MegaMenuItem>
                <MegaMenuItem>Data Pipeline</MegaMenuItem>
                <MegaMenuItem>AI Assistant</MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Solutions</MegaMenuHeader>
                <MegaMenuItem>Enterprise</MegaMenuItem>
                <MegaMenuItem>Startups</MegaMenuItem>
                <MegaMenuItem>Agencies</MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Resources</MegaMenuHeader>
                <MegaMenuItem>Documentation</MegaMenuItem>
                <MegaMenuItem>Guides</MegaMenuItem>
                <MegaMenuItem>API Reference</MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuContainer>
          </div>
        </MegaMenu>
      </div>
      <div style={{ marginTop: "20px" }}>
        <Button>Button After Menu</Button>
      </div>
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
        }}
      >
        <p>
          <strong>Tab Navigation Instructions:</strong>
        </p>
        <ul>
          <li>Click "Open Mega Menu" to open the menu</li>
          <li>Press Tab to focus the first menu item</li>
          <li>Press Tab again to move through items sequentially</li>
          <li>
            Tab moves through items within a group, then to the first item of
            the next group
          </li>
          <li>
            After the last item, pressing Tab closes the menu and focuses the
            button below
          </li>
          <li>Use Shift+Tab to move backwards through items</li>
        </ul>
      </div>
    </div>
  );
};

export const TabNavigation = TabNavigationTemplate.bind({});

const SelectedItemTemplate: StoryFn = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MegaMenu open={isOpen} onOpenChange={setIsOpen}>
      <div style={{ width: "100%" }}>
        <MegaMenuTrigger>
          <Button onClick={() => setIsOpen(true)}>Open Mega Menu</Button>
        </MegaMenuTrigger>

        <MegaMenuContainer>
          <MegaMenuGroup>
            <MegaMenuHeader>Products</MegaMenuHeader>
            <MegaMenuItem>Analytics Platform</MegaMenuItem>
            <MegaMenuItem>Data Pipeline</MegaMenuItem>
            <MegaMenuItem>AI Assistant</MegaMenuItem>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuHeader>Solutions</MegaMenuHeader>
            <MegaMenuItem>Enterprise</MegaMenuItem>
            <MegaMenuItem>Startups</MegaMenuItem>
            <MegaMenuItem>Agencies</MegaMenuItem>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuHeader>Resources</MegaMenuHeader>
            <MegaMenuItem>Documentation</MegaMenuItem>
            <MegaMenuItem>Guides</MegaMenuItem>
            <MegaMenuItem>API Reference</MegaMenuItem>
          </MegaMenuGroup>
        </MegaMenuContainer>
      </div>
    </MegaMenu>
  );
};

export const SelectedItem = SelectedItemTemplate.bind({});
