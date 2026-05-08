import {
  Badge,
  Button,
  FlexLayout,
  Link,
  NavigationItem,
  StackLayout,
  Tag,
  Text,
} from "@salt-ds/core";
import {
  AnnouncementIcon,
  ApiIcon,
  CallIcon,
  CartIcon,
  ChartBubbleIcon,
  ChatGroupIcon,
  ChevronRightIcon,
  DatasetManagerIcon,
  DevicesIcon,
  DisplayIcon,
  DocumentEditIcon,
  DocumentIcon,
  GuideClosedIcon,
  GuideOpenIcon,
  HelpIcon,
  InfoIcon,
  KeyIcon,
  LaptopIcon,
  LinkedIcon,
  MaintenanceIcon,
  MarkerIcon,
  NotificationIcon,
  PasteIcon,
  PinIcon,
  SaveIcon,
  SettingsIcon,
  SwapIcon,
  UserGroupIcon,
  UserIcon,
  UserSearchIcon,
} from "@salt-ds/icons";
import {
  MegaMenu,
  MegaMenuCustomRegion,
  MegaMenuGroup,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuItemContent,
  MegaMenuPanel,
  MegaMenuSection,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import { useState } from "react";
import exampleImage from "../assets/image-skeleton.png";
import exampleImage2 from "../assets/image-skeleton2.png";

import "./mega-menu.stories.css";

export default {
  title: "Lab/Mega Menu",
  parameters: {
    layout: "padded",
  },
  component: MegaMenu,
};

export const WithIcons: StoryFn = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleOpenChange = (menu: string) => (open: boolean) => {
    setOpenMenu(open ? menu : null);
    if (open) {
      setActiveMenu(menu);
    }
  };

  return (
    <nav>
      <StackLayout as="ol" direction="row" gap={1}>
        <li>
          <MegaMenu
            open={openMenu === "solutions"}
            onOpenChange={handleOpenChange("solutions")}
          >
            <MegaMenuTrigger>
              <NavigationItem active={activeMenu === "solutions"}>
                Solutions
              </NavigationItem>
            </MegaMenuTrigger>

            <MegaMenuPanel aria-label="Solutions menu">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial services</MegaMenuHeader>
                  <MegaMenuItem>
                    <DevicesIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <DatasetManagerIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Risk management</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem>
                    <UserSearchIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>
                      Patient management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <CallIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <PasteIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>
                      Compliance solutions
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem>
                    <CartIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>
                      E-commerce platforms
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem>
                    <LinkedIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>
                      Supply chain optimization
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <SettingsIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <NotificationIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>
                      Production planning
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Education</MegaMenuHeader>
                  <MegaMenuItem>
                    <GuideOpenIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>
                      Learning management systems
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <LaptopIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>
                      Virtual classrooms
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Government</MegaMenuHeader>
                  <MegaMenuItem>
                    <DocumentIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>
                      Document management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <PinIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Citizen services</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <UserGroupIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>
                      Public safety solutions
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu
            open={openMenu === "services"}
            onOpenChange={handleOpenChange("services")}
          >
            <MegaMenuTrigger>
              <NavigationItem active={activeMenu === "services"}>
                Services
              </NavigationItem>
            </MegaMenuTrigger>

            <MegaMenuPanel aria-label="Services menu">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Consulting</MegaMenuHeader>
                  <MegaMenuItem>
                    <ChartBubbleIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Strategy</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <LaptopIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>IT</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <UserGroupIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>HR</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MarkerIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Marketing</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <SettingsIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Operations</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Implementation</MegaMenuHeader>
                  <MegaMenuItem>
                    <PasteIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Onboarding</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <SwapIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Migration</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <PinIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Customization</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <GuideClosedIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Training</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <InfoIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Support</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MaintenanceIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Testing</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <SaveIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Rollout</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem>
                    <DisplayIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Online</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <UserIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>In-person</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <KeyIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Workshops</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <DocumentIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Certifications</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <DocumentEditIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Tutorials</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <GuideOpenIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Guides</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu
            open={openMenu === "resources"}
            onOpenChange={handleOpenChange("resources")}
          >
            <MegaMenuTrigger>
              <NavigationItem active={activeMenu === "resources"}>
                Resources
              </NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuPanel aria-label="Resources menu">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Documentation</MegaMenuHeader>
                  <MegaMenuItem>
                    <GuideClosedIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>User guides</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <ApiIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>API reference</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <NotificationIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Release notes</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <HelpIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>FAQs</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & help</MegaMenuHeader>
                  <MegaMenuItem>
                    <InfoIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Contact support</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <ChatGroupIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Community forum</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <AnnouncementIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Troubleshooting</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
      </StackLayout>
    </nav>
  );
};

export const WithAdornment: StoryFn = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleOpenChange = (menu: string) => (open: boolean) => {
    setOpenMenu(open ? menu : null);
    if (open) {
      setActiveMenu(menu);
    }
  };

  return (
    <nav>
      <StackLayout as="ol" direction="row" gap={1}>
        <li>
          <MegaMenu
            open={openMenu === "solutions"}
            onOpenChange={handleOpenChange("solutions")}
          >
            <MegaMenuTrigger>
              <NavigationItem active={activeMenu === "solutions"}>
                Solutions
              </NavigationItem>
            </MegaMenuTrigger>

            <MegaMenuPanel aria-label="Solutions menu">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial services</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Risk management</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Patient management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Telemedicine
                      <Tag
                        category={1}
                        variant="primary"
                        className="menu-item-adornment"
                      >
                        Premium
                      </Tag>
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Compliance solutions
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      E-commerce platforms
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Supply chain optimization
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Production planning
                      <Tag
                        category={2}
                        variant="primary"
                        className="menu-item-adornment"
                      >
                        New
                      </Tag>
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Education</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Learning management systems
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Virtual classrooms
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Government</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Document management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Citizen services</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Public safety solutions
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu
            open={openMenu === "services"}
            onOpenChange={handleOpenChange("services")}
          >
            <MegaMenuTrigger>
              <NavigationItem active={activeMenu === "services"}>
                Services
              </NavigationItem>
            </MegaMenuTrigger>

            <MegaMenuPanel aria-label="Services menu">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Consulting</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Strategy</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>IT</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>HR</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Marketing</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Operations</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Implementation</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Onboarding</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Migration</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Customization</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      {" "}
                      Training
                      <Badge value="1" className="menu-item-adornment" />
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Support</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Testing</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Rollout</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Online</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      {" "}
                      In-person
                      <Badge value="3" className="menu-item-adornment" />
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Workshops</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Certifications</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Tutorials</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Guides</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu
            open={openMenu === "resources"}
            onOpenChange={handleOpenChange("resources")}
          >
            <MegaMenuTrigger>
              <NavigationItem active={activeMenu === "resources"}>
                Resources
              </NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuPanel aria-label="Resources menu">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Documentation</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>User guides</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>API reference</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Release notes <Badge className="menu-item-adornment" />
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>FAQs</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & help</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Contact support</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Community forum
                      <Tag
                        category={2}
                        variant="primary"
                        className="menu-item-adornment"
                      >
                        New
                      </Tag>
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Troubleshooting</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
      </StackLayout>
    </nav>
  );
};

export const TriggerPosition: StoryFn = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className="trigger-position-grid">
      <div className="trigger-position-left">
        <MegaMenu
          open={openMenu === "left"}
          onOpenChange={(open) => setOpenMenu(open ? "left" : null)}
        >
          <MegaMenuTrigger>
            <Button>Near Left Edge</Button>
          </MegaMenuTrigger>

          <MegaMenuPanel aria-label="Near Left Edge menu">
            <MegaMenuSection>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 1</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 1</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 2</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 3</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 4</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 5</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 6</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 7</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 8</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 9</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 10</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 11</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 12</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuSection>
          </MegaMenuPanel>
        </MegaMenu>
      </div>
      <div className="trigger-position-center">
        <MegaMenu
          open={openMenu === "center"}
          onOpenChange={(open) => setOpenMenu(open ? "center" : null)}
        >
          <MegaMenuTrigger>
            <Button>On Center</Button>
          </MegaMenuTrigger>

          <MegaMenuPanel aria-label="On Center menu">
            <MegaMenuSection>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 1</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 1</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 2</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 3</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 4</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 5</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 6</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 7</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 8</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 9</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 10</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 11</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 12</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuSection>
          </MegaMenuPanel>
        </MegaMenu>
      </div>
      <div className="trigger-position-offset">
        <MegaMenu
          open={openMenu === "offset"}
          onOpenChange={(open) => setOpenMenu(open ? "offset" : null)}
        >
          <MegaMenuTrigger>
            <Button>Slightly Offset</Button>
          </MegaMenuTrigger>

          <MegaMenuPanel aria-label="Slightly Offset menu">
            <MegaMenuSection>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 1</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 1</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 2</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 3</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 4</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 5</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 6</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 7</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 8</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 9</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 10</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 11</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 12</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuSection>
          </MegaMenuPanel>
        </MegaMenu>
      </div>

      <div className="trigger-position-right">
        <MegaMenu
          open={openMenu === "right"}
          onOpenChange={(open) => setOpenMenu(open ? "right" : null)}
        >
          <MegaMenuTrigger>
            <Button>Near The Edge</Button>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Near The Edge menu">
            <MegaMenuSection>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 1</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 1</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 2</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 3</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 4</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 5</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 6</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 7</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 8</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 9</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 10</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 11</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Mega menu item 12</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuSection>
          </MegaMenuPanel>
        </MegaMenu>
      </div>
    </div>
  );
};

export const FullWidthContainer: StoryFn = () => {
  return (
    <MegaMenu>
      <MegaMenuTrigger>
        <Button>Open Full Width Mega Menu</Button>
      </MegaMenuTrigger>

      <MegaMenuPanel
        style={{ width: "100vw", maxWidth: "100vw", boxSizing: "border-box" }}
      >
        <MegaMenuSection>
          <MegaMenuGroup>
            <MegaMenuHeader>Products</MegaMenuHeader>
            <MegaMenuItem>
              <MegaMenuItemContent>Analytics workspace</MegaMenuItemContent>
            </MegaMenuItem>
            <MegaMenuItem>
              <MegaMenuItemContent>Order management</MegaMenuItemContent>
            </MegaMenuItem>
            <MegaMenuItem>
              <MegaMenuItemContent>Pricing configurator</MegaMenuItemContent>
            </MegaMenuItem>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuHeader>Solutions</MegaMenuHeader>
            <MegaMenuItem>
              <MegaMenuItemContent>Risk monitoring</MegaMenuItemContent>
            </MegaMenuItem>
            <MegaMenuItem>
              <MegaMenuItemContent>Client reporting</MegaMenuItemContent>
            </MegaMenuItem>
            <MegaMenuItem>
              <MegaMenuItemContent>Trade automation</MegaMenuItemContent>
            </MegaMenuItem>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuHeader>Resources</MegaMenuHeader>
            <MegaMenuItem>
              <MegaMenuItemContent>Documentation</MegaMenuItemContent>
            </MegaMenuItem>
            <MegaMenuItem>
              <MegaMenuItemContent>Release notes</MegaMenuItemContent>
            </MegaMenuItem>
            <MegaMenuItem>
              <MegaMenuItemContent>Developer API</MegaMenuItemContent>
            </MegaMenuItem>
          </MegaMenuGroup>
        </MegaMenuSection>
      </MegaMenuPanel>
    </MegaMenu>
  );
};

FullWidthContainer.parameters = {
  layout: "fullscreen",
};

export const WithCustomRegion: StoryFn = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <StackLayout direction="column" gap={2}>
      <MegaMenu
        open={openMenu === "right"}
        onOpenChange={(open) => setOpenMenu(open ? "right" : null)}
      >
        <div className="custom-region-wrapper">
          <MegaMenuTrigger>
            <Button>Custom Region on Right</Button>
          </MegaMenuTrigger>
          <MegaMenuPanel className="custom-region-no-container-padding">
            <div className="custom-region-content">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial services</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Risk management</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Patient management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Compliance solutions
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      E-commerce platforms
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Supply chain optimization
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Production planning
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <MegaMenuGroup
                style={{
                  padding:
                    " 0 var(--salt-spacing-300)  var(--salt-spacing-300)",
                  width: "fit-content",
                }}
              >
                <Link
                  color="primary"
                  underline="default"
                  href="#link"
                  IconComponent={ChevronRightIcon}
                >
                  View guidelines
                </Link>
              </MegaMenuGroup>
            </div>
            <MegaMenuCustomRegion
              variant="tertiary"
              style={{ width: "fit-content" }}
            >
              <FlexLayout direction={"column"} wrap gap={2}>
                <img
                  alt="example"
                  src={exampleImage}
                  className="custom-region-image"
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0}>
                    <Text styleAs="h2" as="h2">
                      Featured resource
                    </Text>
                    <Text className="custom-region-right-description">
                      Explore our latest accessibility guidelines to ensure your
                      components meet ADA standards and provide an inclusive
                      user experience.
                    </Text>
                  </StackLayout>
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    View guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuCustomRegion>
          </MegaMenuPanel>
        </div>
      </MegaMenu>

      <MegaMenu
        open={openMenu === "left"}
        onOpenChange={(open) => setOpenMenu(open ? "left" : null)}
      >
        <div className="custom-region-wrapper">
          <MegaMenuTrigger>
            <Button>Custom Region on Left</Button>
          </MegaMenuTrigger>

          <MegaMenuPanel className="custom-region-no-container-padding">
            <MegaMenuCustomRegion variant="secondary">
              <FlexLayout direction={"column"} wrap gap={2}>
                <img
                  alt="example"
                  src={exampleImage}
                  className="custom-region-image"
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0}>
                    <Text styleAs="h2" as="h2">
                      Featured resource
                    </Text>
                    <Text className="custom-region-right-description">
                      Explore our latest accessibility guidelines to ensure your
                      components meet ADA standards and provide an inclusive
                      user experience.
                    </Text>
                  </StackLayout>
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    View guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuCustomRegion>
            <div className="custom-region-content">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial services</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Risk management</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Patient management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Compliance solutions
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      E-commerce platforms
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Supply chain optimization
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Production planning
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <MegaMenuGroup
                style={{
                  padding:
                    " 0 var(--salt-spacing-300)  var(--salt-spacing-300)",
                  width: "fit-content",
                }}
              >
                <Link
                  color="primary"
                  underline="default"
                  href="#link"
                  IconComponent={ChevronRightIcon}
                >
                  View guidelines
                </Link>
              </MegaMenuGroup>
            </div>
          </MegaMenuPanel>
        </div>
      </MegaMenu>

      <MegaMenu
        open={openMenu === "top"}
        onOpenChange={(open) => setOpenMenu(open ? "top" : null)}
      >
        <div className="custom-region-wrapper">
          <MegaMenuTrigger>
            <Button>Custom Region on Top</Button>
          </MegaMenuTrigger>

          <MegaMenuPanel
            className="custom-region-no-container-padding"
            style={{ flexDirection: "column" }}
          >
            <MegaMenuCustomRegion variant="primary">
              <FlexLayout direction={"column"} wrap gap={2}>
                <img
                  alt="example"
                  src={exampleImage2}
                  className="custom-region-image"
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0}>
                    <Text styleAs="h2" as="h2">
                      Featured resource
                    </Text>
                    <Text>
                      Explore our latest accessibility guidelines to ensure your
                      components meet ADA standards and provide an inclusive
                      user experience.
                    </Text>
                  </StackLayout>
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    View guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuCustomRegion>
            <MegaMenuSection>
              <MegaMenuGroup>
                <MegaMenuHeader>Financial services</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Risk management</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Healthcare</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Patient management</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>
                    Compliance solutions
                  </MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Retail</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>
                    E-commerce platforms
                  </MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>
                    Supply chain optimization
                  </MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Production planning</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuSection>
            <MegaMenuGroup
              style={{
                padding: " 0 var(--salt-spacing-300)  var(--salt-spacing-300)",
                width: "fit-content",
              }}
            >
              <Link
                color="primary"
                underline="default"
                href="#link"
                IconComponent={ChevronRightIcon}
              >
                View guidelines
              </Link>
            </MegaMenuGroup>
          </MegaMenuPanel>
        </div>
      </MegaMenu>

      <MegaMenu
        open={openMenu === "bottom"}
        onOpenChange={(open) => setOpenMenu(open ? "bottom" : null)}
      >
        <div className="custom-region-wrapper">
          <MegaMenuTrigger>
            <Button>Custom Region on Bottom</Button>
          </MegaMenuTrigger>

          <MegaMenuPanel
            className="custom-region-no-container-padding"
            style={{ flexDirection: "column" }}
          >
            <MegaMenuSection>
              <MegaMenuGroup>
                <MegaMenuHeader>Financial services</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Risk management</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Healthcare</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Patient management</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>
                    Compliance solutions
                  </MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Retail</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>
                    E-commerce platforms
                  </MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>
                    Supply chain optimization
                  </MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Production planning</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuSection>
            <MegaMenuGroup
              style={{
                padding: " 0 var(--salt-spacing-300)  var(--salt-spacing-300)",
                width: "fit-content",
              }}
            >
              <Link
                color="primary"
                underline="default"
                href="#link"
                IconComponent={ChevronRightIcon}
              >
                View guidelines
              </Link>
            </MegaMenuGroup>
            <MegaMenuCustomRegion variant="tertiary">
              <FlexLayout direction={"column"} wrap gap={2}>
                <img
                  alt="example"
                  src={exampleImage2}
                  className="custom-region-image"
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0}>
                    <Text styleAs="h2" as="h2">
                      Featured resource
                    </Text>
                    <Text>
                      Explore our latest accessibility guidelines to ensure your
                      components meet ADA standards and provide an inclusive
                      user experience.
                    </Text>
                  </StackLayout>
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    View guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuCustomRegion>
          </MegaMenuPanel>
        </div>
      </MegaMenu>
    </StackLayout>
  );
};

export const WithLink: StoryFn = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleOpenChange = (menu: string) => (open: boolean) => {
    setOpenMenu(open ? menu : null);
    if (open) {
      setActiveMenu(menu);
    }
  };

  return (
    <nav>
      <StackLayout as="ol" direction="row" gap={1}>
        <li>
          <MegaMenu
            open={openMenu === "solutions"}
            onOpenChange={handleOpenChange("solutions")}
          >
            <MegaMenuTrigger>
              <NavigationItem active={activeMenu === "solutions"}>
                Solutions
              </NavigationItem>
            </MegaMenuTrigger>

            <MegaMenuPanel className="withLink-menu-container">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial services</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Digital banking",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Risk management",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Risk management</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Patient management",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Patient management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Telemedicine",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Compliance solutions",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Compliance solutions
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "E-commerce platforms",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      E-commerce platforms
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Supply chain optimization",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Supply chain optimization
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Quality control",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Production planning",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Production planning
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Education</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Learning management systems",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Learning management systems
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Virtual classrooms",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Virtual classrooms
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Government</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Document management",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Document management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Citizen services",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Citizen services</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Public safety solutions",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Public safety solutions
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <FlexLayout wrap gap={3}>
                <MegaMenuGroup className="link-footer-spacing">
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    Book a demo
                  </Link>
                </MegaMenuGroup>
                <MegaMenuGroup className="link-footer-spacing">
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    Support center
                  </Link>
                </MegaMenuGroup>
              </FlexLayout>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu
            open={openMenu === "services"}
            onOpenChange={handleOpenChange("services")}
          >
            <MegaMenuTrigger>
              <NavigationItem active={activeMenu === "services"}>
                Services
              </NavigationItem>
            </MegaMenuTrigger>

            <MegaMenuPanel className="withLink-menu-container">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Consulting</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Strategy",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Strategy</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log("[WithLink MegaMenu] selected value:", "IT");
                    }}
                  >
                    <MegaMenuItemContent>IT</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log("[WithLink MegaMenu] selected value:", "HR");
                    }}
                  >
                    <MegaMenuItemContent>HR</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Marketing",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Marketing</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Operations",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Operations</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Implementation</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Onboarding",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Onboarding</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Migration",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Migration</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Customization",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Customization</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Training",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Training</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Support",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Support</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Testing",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Testing</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Rollout",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Rollout</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Online",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Online</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "In-person",
                      );
                    }}
                  >
                    <MegaMenuItemContent>In-person</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Workshops",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Workshops</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Certifications",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Certifications</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Tutorials",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Tutorials</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Guides",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Guides</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <MegaMenuGroup className="link-footer-spacing">
                <Link
                  color="primary"
                  underline="default"
                  href="#link"
                  IconComponent={ChevronRightIcon}
                >
                  Service status
                </Link>
              </MegaMenuGroup>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu
            open={openMenu === "resources"}
            onOpenChange={handleOpenChange("resources")}
          >
            <MegaMenuTrigger>
              <NavigationItem active={activeMenu === "resources"}>
                Resources
              </NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuPanel className="withLink-menu-container">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Documentation</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "User guides",
                      );
                    }}
                  >
                    <MegaMenuItemContent>User guides</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "API reference",
                      );
                    }}
                  >
                    <MegaMenuItemContent>API reference</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Release notes",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Release notes</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "FAQs",
                      );
                    }}
                  >
                    <MegaMenuItemContent>FAQs</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & help</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Contact support",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Contact support</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Community forum",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Community forum</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Troubleshooting",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Troubleshooting</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <MegaMenuGroup className="link-footer-spacing">
                <Link
                  color="primary"
                  underline="default"
                  href="#link"
                  IconComponent={ChevronRightIcon}
                >
                  Browse documentation
                </Link>
              </MegaMenuGroup>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
      </StackLayout>
    </nav>
  );
};

export const InSmallViewport: StoryFn = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleOpenChange = (menu: string) => (open: boolean) => {
    setOpenMenu(open ? menu : null);
    if (open) {
      setActiveMenu(menu);
    }
  };

  return (
    <div className="small-viewport-wrapper">
      <nav>
        <StackLayout as="ol" direction="row" gap={1}>
          <li>
            <MegaMenu
              open={openMenu === "solutions"}
              onOpenChange={handleOpenChange("solutions")}
            >
              <MegaMenuTrigger>
                <NavigationItem active={activeMenu === "solutions"}>
                  Solutions
                </NavigationItem>
              </MegaMenuTrigger>
              <MegaMenuPanel
                className="small-viewport-container"
                aria-label="Solutions menu"
              >
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Financial services</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Digital banking",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Risk management",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Risk management</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Healthcare</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Patient management",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Patient management
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Telemedicine",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Compliance solutions",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Compliance solutions
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Retail</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "E-commerce platforms",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        E-commerce platforms
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Supply chain optimization",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Supply chain optimization
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Quality control",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Production planning",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Production planning
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Education</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Learning management systems",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Learning management systems
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Virtual classrooms",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Virtual classrooms
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Government</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Document management",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Document management
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Citizen services",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Citizen services
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Public safety solutions",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Public safety solutions
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                </MegaMenuSection>
              </MegaMenuPanel>
            </MegaMenu>
          </li>
          <li>
            <MegaMenu
              open={openMenu === "services"}
              onOpenChange={handleOpenChange("services")}
            >
              <MegaMenuTrigger>
                <NavigationItem active={activeMenu === "services"}>
                  Services
                </NavigationItem>
              </MegaMenuTrigger>
              <MegaMenuPanel
                className="small-viewport-container"
                aria-label="Services menu"
              >
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Consulting</MegaMenuHeader>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Strategy</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>IT</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>HR</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Marketing</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Operations</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Implementation</MegaMenuHeader>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Onboarding</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Migration</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Customization</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Training</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Support</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Training</MegaMenuHeader>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Online</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>In-person</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Workshops</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Certifications</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                </MegaMenuSection>
              </MegaMenuPanel>
            </MegaMenu>
          </li>
          <li>
            <MegaMenu
              open={openMenu === "resources"}
              onOpenChange={handleOpenChange("resources")}
            >
              <MegaMenuTrigger>
                <NavigationItem active={activeMenu === "resources"}>
                  Resources
                </NavigationItem>
              </MegaMenuTrigger>
              <MegaMenuPanel
                className="small-viewport-container"
                aria-label="Resources menu"
              >
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Documentation</MegaMenuHeader>
                    <MegaMenuItem>
                      <MegaMenuItemContent>User guides</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>API reference</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Release notes</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>FAQs</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Support</MegaMenuHeader>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Contact support</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Community forum</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Troubleshooting</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Learn</MegaMenuHeader>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Tutorials</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Guides</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem>
                      <MegaMenuItemContent>Best practices</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                </MegaMenuSection>
              </MegaMenuPanel>
            </MegaMenu>
          </li>
        </StackLayout>
      </nav>
    </div>
  );
};

export const DefaultOpen: StoryFn = () => {
  return (
    <nav>
      <StackLayout as="ol" direction="row" gap={1}>
        <li>
          <MegaMenu defaultOpen>
            <MegaMenuTrigger>
              <NavigationItem>Solutions</NavigationItem>
            </MegaMenuTrigger>

            <MegaMenuPanel aria-label="Solutions menu">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial services</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Risk management</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Patient management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      Compliance solutions
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem>
                    <MegaMenuItemContent>
                      E-commerce platforms
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
      </StackLayout>
    </nav>
  );
};

export const Placement: StoryFn = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <StackLayout
      direction="row"
      gap={2}
      style={{ justifyContent: "center", paddingTop: 200 }}
    >
      {(
        [
          "bottom",
          "bottom-start",
          "bottom-end",
          "top",
          "top-start",
          "top-end",
        ] as const
      ).map((placement) => (
        <MegaMenu
          key={placement}
          open={openMenu === placement}
          onOpenChange={(open) => setOpenMenu(open ? placement : null)}
          placement={placement}
        >
          <MegaMenuTrigger>
            <Button>{placement}</Button>
          </MegaMenuTrigger>

          <MegaMenuPanel aria-label={`${placement} menu`}>
            <MegaMenuSection>
              <MegaMenuGroup>
                <MegaMenuHeader>Group A</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Item 1</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Item 2</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Item 3</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Group B</MegaMenuHeader>
                <MegaMenuItem>
                  <MegaMenuItemContent>Item 4</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem>
                  <MegaMenuItemContent>Item 5</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuSection>
          </MegaMenuPanel>
        </MegaMenu>
      ))}
    </StackLayout>
  );
};
