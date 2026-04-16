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
  ApiIcon,
  CallIcon,
  CartIcon,
  ChatGroupIcon,
  ChevronRightIcon,
  DevicesIcon,
  DisplayIcon,
  DocumentIcon,
  GuideClosedIcon,
  GuideOpenIcon,
  HelpIcon,
  InfoIcon,
  KeyIcon,
  LaptopIcon,
  LinkedIcon,
  MarkerIcon,
  NotificationIcon,
  PasteIcon,
  PinIcon,
  SaveIcon,
  SettingsIcon,
  SwapIcon,
  UserGroupIcon,
  UserIcon,
} from "@salt-ds/icons";
import {
  MegaMenu,
  MegaMenuContainer,
  MegaMenuCustomRegion,
  MegaMenuGroup,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuLinkRow,
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
  component: MegaMenuContainer,
};

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
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem>Digital Banking</MegaMenuItem>
                  <MegaMenuItem>Risk Management</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem>Patient Management</MegaMenuItem>
                  <MegaMenuItem>Telemedicine</MegaMenuItem>
                  <MegaMenuItem>Compliance Solutions</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem>E-Commerce Platforms</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem>Supply Chain Optimization</MegaMenuItem>
                  <MegaMenuItem>Quality Control</MegaMenuItem>
                  <MegaMenuItem>Production Planning</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Education</MegaMenuHeader>
                  <MegaMenuItem>Learning Management Systems</MegaMenuItem>
                  <MegaMenuItem>Virtual Classrooms</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Government</MegaMenuHeader>
                  <MegaMenuItem>Document Management</MegaMenuItem>
                  <MegaMenuItem>Citizen Services</MegaMenuItem>
                  <MegaMenuItem>Public Safety Solutions</MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
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
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Consulting</MegaMenuHeader>
                  <MegaMenuItem>Strategy</MegaMenuItem>
                  <MegaMenuItem>IT</MegaMenuItem>
                  <MegaMenuItem>HR</MegaMenuItem>
                  <MegaMenuItem>Marketing</MegaMenuItem>
                  <MegaMenuItem>Operations</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Implementation</MegaMenuHeader>
                  <MegaMenuItem>Onboarding</MegaMenuItem>
                  <MegaMenuItem>Migration</MegaMenuItem>
                  <MegaMenuItem>Customization</MegaMenuItem>
                  <MegaMenuItem>Training</MegaMenuItem>
                  <MegaMenuItem>Support</MegaMenuItem>
                  <MegaMenuItem>Testing</MegaMenuItem>
                  <MegaMenuItem>Rollout</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem>Online</MegaMenuItem>
                  <MegaMenuItem>In-Person</MegaMenuItem>
                  <MegaMenuItem>Workshops</MegaMenuItem>
                  <MegaMenuItem>Certifications</MegaMenuItem>
                  <MegaMenuItem>Tutorials</MegaMenuItem>
                  <MegaMenuItem>Guides</MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
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
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Documentation</MegaMenuHeader>
                  <MegaMenuItem>User Guides</MegaMenuItem>
                  <MegaMenuItem>API Reference</MegaMenuItem>
                  <MegaMenuItem>Release Notes</MegaMenuItem>
                  <MegaMenuItem>FAQs</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & Help</MegaMenuHeader>
                  <MegaMenuItem>Contact Support</MegaMenuItem>
                  <MegaMenuItem>Community Forum</MegaMenuItem>
                  <MegaMenuItem>Troubleshooting</MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuContainer>
          </MegaMenu>
        </li>
      </StackLayout>
    </nav>
  );
};

export const Default = WithNavigationItemsTemplate.bind({});

const WithIconsTemplate: StoryFn = () => {
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
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem>
                    <DevicesIcon aria-hidden />
                    Digital Banking
                  </MegaMenuItem>
                  <MegaMenuItem>Risk Management</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem>Patient Management</MegaMenuItem>
                  <MegaMenuItem>
                    <CallIcon aria-hidden />
                    Telemedicine
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <PasteIcon aria-hidden />
                    Compliance Solutions
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem>
                    <CartIcon aria-hidden />
                    E-Commerce Platforms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem>
                    <LinkedIcon aria-hidden />
                    Supply Chain Optimization
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <SettingsIcon aria-hidden />
                    Quality Control
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <NotificationIcon aria-hidden />
                    Production Planning
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Education</MegaMenuHeader>
                  <MegaMenuItem>
                    <GuideOpenIcon aria-hidden />
                    Learning Management Systems
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <LaptopIcon aria-hidden />
                    Virtual Classrooms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Government</MegaMenuHeader>
                  <MegaMenuItem>
                    <DocumentIcon aria-hidden />
                    Document Management
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <PinIcon aria-hidden />
                    Citizen Services
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <UserGroupIcon aria-hidden />
                    Public Safety Solutions
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
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
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Consulting</MegaMenuHeader>
                  <MegaMenuItem>Strategy</MegaMenuItem>
                  <MegaMenuItem>
                    <LaptopIcon aria-hidden />
                    IT
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <UserGroupIcon aria-hidden />
                    HR
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MarkerIcon aria-hidden />
                    Marketing
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <SettingsIcon aria-hidden />
                    Operations
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Implementation</MegaMenuHeader>
                  <MegaMenuItem>
                    <PasteIcon aria-hidden />
                    Onboarding
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <SwapIcon aria-hidden />
                    Migration
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <PinIcon aria-hidden />
                    Customization
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <GuideClosedIcon aria-hidden />
                    Training
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <InfoIcon aria-hidden />
                    Support
                  </MegaMenuItem>
                  <MegaMenuItem>Testing</MegaMenuItem>
                  <MegaMenuItem>
                    <SaveIcon aria-hidden />
                    Rollout
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem>
                    <DisplayIcon aria-hidden />
                    Online
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <UserIcon aria-hidden />
                    In-Person
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <KeyIcon aria-hidden />
                    Workshops
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <DocumentIcon aria-hidden />
                    Certifications
                  </MegaMenuItem>
                  <MegaMenuItem>Tutorials</MegaMenuItem>
                  <MegaMenuItem>
                    <GuideOpenIcon aria-hidden /> Guides
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
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
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Documentation</MegaMenuHeader>
                  <MegaMenuItem>User Guides</MegaMenuItem>
                  <MegaMenuItem>
                    <ApiIcon aria-hidden />
                    API Reference
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <NotificationIcon aria-hidden />
                    Release Notes
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <HelpIcon aria-hidden />
                    FAQs
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & Help</MegaMenuHeader>
                  <MegaMenuItem>
                    <InfoIcon aria-hidden />
                    Contact Support
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <ChatGroupIcon aria-hidden />
                    Community Forum
                  </MegaMenuItem>
                  <MegaMenuItem>Troubleshooting</MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuContainer>
          </MegaMenu>
        </li>
      </StackLayout>
    </nav>
  );
};

export const WithIcons = WithIconsTemplate.bind({});

const WithStaticAdornmentTemplate: StoryFn = () => {
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
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem>Digital Banking</MegaMenuItem>
                  <MegaMenuItem>Risk Management</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem>Patient Management</MegaMenuItem>
                  <MegaMenuItem>
                    Telemedicine{" "}
                    <Tag category={1} variant="primary">
                      Premium
                    </Tag>
                  </MegaMenuItem>
                  <MegaMenuItem>Compliance Solutions</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem>E-Commerce Platforms</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem>Supply Chain Optimization</MegaMenuItem>
                  <MegaMenuItem>Quality Control</MegaMenuItem>
                  <MegaMenuItem>
                    Production Planning{" "}
                    <Tag category={2} variant="primary">
                      New
                    </Tag>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Education</MegaMenuHeader>
                  <MegaMenuItem>Learning Management Systems</MegaMenuItem>
                  <MegaMenuItem>Virtual Classrooms</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Government</MegaMenuHeader>
                  <MegaMenuItem>Document Management</MegaMenuItem>
                  <MegaMenuItem>Citizen Services</MegaMenuItem>
                  <MegaMenuItem>Public Safety Solutions</MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
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
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Consulting</MegaMenuHeader>
                  <MegaMenuItem>Strategy</MegaMenuItem>
                  <MegaMenuItem>IT</MegaMenuItem>
                  <MegaMenuItem>HR</MegaMenuItem>
                  <MegaMenuItem>Marketing</MegaMenuItem>
                  <MegaMenuItem>Operations</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Implementation</MegaMenuHeader>
                  <MegaMenuItem>Onboarding</MegaMenuItem>
                  <MegaMenuItem>Migration</MegaMenuItem>
                  <MegaMenuItem>Customization</MegaMenuItem>
                  <MegaMenuItem>
                    Training <Badge value="1" />
                  </MegaMenuItem>
                  <MegaMenuItem>Support</MegaMenuItem>
                  <MegaMenuItem>Testing</MegaMenuItem>
                  <MegaMenuItem>Rollout</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem>Online</MegaMenuItem>
                  <MegaMenuItem>
                    In-Person <Badge value="3" />
                  </MegaMenuItem>
                  <MegaMenuItem>Workshops</MegaMenuItem>
                  <MegaMenuItem>Certifications</MegaMenuItem>
                  <MegaMenuItem>Tutorials</MegaMenuItem>
                  <MegaMenuItem>Guides</MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
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
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Documentation</MegaMenuHeader>
                  <MegaMenuItem>User Guides</MegaMenuItem>
                  <MegaMenuItem>API Reference</MegaMenuItem>
                  <MegaMenuItem>
                    Release Notes <Badge />
                  </MegaMenuItem>
                  <MegaMenuItem>FAQs</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & Help</MegaMenuHeader>
                  <MegaMenuItem>Contact Support</MegaMenuItem>
                  <MegaMenuItem>
                    Community Forum{" "}
                    <Tag category={2} variant="primary">
                      New
                    </Tag>
                  </MegaMenuItem>
                  <MegaMenuItem>Troubleshooting</MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuContainer>
          </MegaMenu>
        </li>
      </StackLayout>
    </nav>
  );
};

export const WithStaticAdornment = WithStaticAdornmentTemplate.bind({});

const TriggerPositionTemplate: StoryFn = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className="triggerPositionGrid">
      <div className="triggerPositionLeft">
        <MegaMenu
          open={openMenu === "left"}
          onOpenChange={(open) => setOpenMenu(open ? "left" : null)}
        >
          <MegaMenuTrigger>
            <Button onClick={() => setOpenMenu("left")}>Near Left Edge</Button>
          </MegaMenuTrigger>

          <MegaMenuContainer>
            <MegaMenuSection>
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
            </MegaMenuSection>
          </MegaMenuContainer>
        </MegaMenu>
      </div>
      <div className="triggerPositionCenter">
        <MegaMenu
          open={openMenu === "center"}
          onOpenChange={(open) => setOpenMenu(open ? "center" : null)}
        >
          <MegaMenuTrigger>
            <Button onClick={() => setOpenMenu("center")}>On Center</Button>
          </MegaMenuTrigger>

          <MegaMenuContainer>
            <MegaMenuSection>
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
            </MegaMenuSection>
          </MegaMenuContainer>
        </MegaMenu>
      </div>
      <div className="triggerPositionOffset">
        <MegaMenu
          open={openMenu === "offset"}
          onOpenChange={(open) => setOpenMenu(open ? "offset" : null)}
        >
          <MegaMenuTrigger>
            <Button onClick={() => setOpenMenu("offset")}>
              Slightly Offset
            </Button>
          </MegaMenuTrigger>

          <MegaMenuContainer>
            <MegaMenuSection>
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
            </MegaMenuSection>
          </MegaMenuContainer>
        </MegaMenu>
      </div>

      <div className="triggerPositionRight">
        <MegaMenu
          open={openMenu === "right"}
          onOpenChange={(open) => setOpenMenu(open ? "right" : null)}
        >
          <MegaMenuTrigger>
            <Button onClick={() => setOpenMenu("right")}>Near The Edge</Button>
          </MegaMenuTrigger>
          <MegaMenuContainer>
            <MegaMenuSection>
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
            </MegaMenuSection>
          </MegaMenuContainer>
        </MegaMenu>
      </div>
    </div>
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
        <MegaMenuSection>
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
        </MegaMenuSection>
      </MegaMenuContainer>
    </MegaMenu>
  );
};

export const FullWidthContainer = FullWidthContainerTemplate.bind({});

FullWidthContainer.parameters = {
  layout: "fullscreen",
};

const WithCustomRegionTemplate: StoryFn = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <StackLayout direction="column" gap={2}>
      <MegaMenu
        open={openMenu === "right"}
        onOpenChange={(open) => setOpenMenu(open ? "right" : null)}
      >
        <div className="customRegionWrapper">
          <MegaMenuTrigger>
            <Button onClick={() => setOpenMenu("right")}>
              Custom Region on Right
            </Button>
          </MegaMenuTrigger>
          <MegaMenuContainer className="customRegionNoContainerPadding">
            <MegaMenuSection className="customRegionGroupsColumn">
              <div className="customRegionGroups">
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem>Digital Banking</MegaMenuItem>
                  <MegaMenuItem>Risk Management</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem>Patient Management</MegaMenuItem>
                  <MegaMenuItem>Telemedicine</MegaMenuItem>
                  <MegaMenuItem>Compliance Solutions</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem>E-Commerce Platforms</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem>Supply Chain Optimization</MegaMenuItem>
                  <MegaMenuItem>Quality Control</MegaMenuItem>
                  <MegaMenuItem>Production Planning</MegaMenuItem>
                </MegaMenuGroup>
              </div>
              <MegaMenuLinkRow className="defaultBottomLinkRow">
                <Link href="#">Explore details</Link>
              </MegaMenuLinkRow>
            </MegaMenuSection>
            <MegaMenuCustomRegion
              variant="tertiary"
              style={{ width: "fit-content" }}
            >
              <FlexLayout direction={"column"} wrap gap={2}>
                <img
                  alt="example"
                  src={exampleImage}
                  className="customRegionImage"
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0}>
                    <Text styleAs="h2">Featured Resource</Text>
                    <Text className="customRegionRightDescription">
                      Explore our latest accessibility guidelines to ensure your
                      components meet ADA standards and provide an inclusive
                      user experience.
                    </Text>
                  </StackLayout>
                  <Link
                    color="primary"
                    underline="default"
                    target="_blank"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    View Guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuCustomRegion>
          </MegaMenuContainer>
        </div>
      </MegaMenu>

      <MegaMenu
        open={openMenu === "left"}
        onOpenChange={(open) => setOpenMenu(open ? "left" : null)}
      >
        <div className="customRegionWrapper">
          <MegaMenuTrigger>
            <Button onClick={() => setOpenMenu("left")}>
              Custom Region on Left
            </Button>
          </MegaMenuTrigger>

          <MegaMenuContainer className="customRegionNoContainerPadding">
            <MegaMenuCustomRegion variant="secondary">
              <FlexLayout direction={"column"} wrap gap={2}>
                <img
                  alt="example"
                  src={exampleImage}
                  className="customRegionImage"
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0}>
                    <Text styleAs="h2">Featured Resource</Text>
                    <Text className="customRegionRightDescription">
                      Explore our latest accessibility guidelines to ensure your
                      components meet ADA standards and provide an inclusive
                      user experience.
                    </Text>
                  </StackLayout>
                  <Link
                    color="primary"
                    underline="default"
                    target="_blank"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    View Guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuCustomRegion>
            <MegaMenuSection className="customRegionGroupsColumn">
              <div className="customRegionGroups">
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem>Digital Banking</MegaMenuItem>
                  <MegaMenuItem>Risk Management</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem>Patient Management</MegaMenuItem>
                  <MegaMenuItem>Telemedicine</MegaMenuItem>
                  <MegaMenuItem>Compliance Solutions</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem>E-Commerce Platforms</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem>Supply Chain Optimization</MegaMenuItem>
                  <MegaMenuItem>Quality Control</MegaMenuItem>
                  <MegaMenuItem>Production Planning</MegaMenuItem>
                </MegaMenuGroup>
              </div>
              <MegaMenuLinkRow className="defaultBottomLinkRow">
                <Link href="#">Explore details</Link>
              </MegaMenuLinkRow>
            </MegaMenuSection>
          </MegaMenuContainer>
        </div>
      </MegaMenu>

      <MegaMenu
        open={openMenu === "top"}
        onOpenChange={(open) => setOpenMenu(open ? "top" : null)}
      >
        <div className="customRegionWrapper">
          <MegaMenuTrigger>
            <Button onClick={() => setOpenMenu("top")}>
              Custom Region on Top
            </Button>
          </MegaMenuTrigger>

          <MegaMenuContainer className="customRegionContainerColumn customRegionNoContainerPadding">
            <MegaMenuCustomRegion variant="primary">
              <FlexLayout direction={"column"} wrap gap={2}>
                <img
                  alt="example"
                  src={exampleImage2}
                  className="customRegionImage"
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0}>
                    <Text styleAs="h2">Featured Resource</Text>
                    <Text>
                      Explore our latest accessibility guidelines to ensure your
                      components meet ADA standards and provide an inclusive
                      user experience.
                    </Text>
                  </StackLayout>
                  <Link
                    color="primary"
                    underline="default"
                    target="_blank"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    View Guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuCustomRegion>
            <MegaMenuSection className="customRegionContainerColumn">
              <div className="customRegionTopBottomGroups">
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem>Digital Banking</MegaMenuItem>
                  <MegaMenuItem>Risk Management</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem>Patient Management</MegaMenuItem>
                  <MegaMenuItem>Telemedicine</MegaMenuItem>
                  <MegaMenuItem>Compliance Solutions</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem>E-Commerce Platforms</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem>Supply Chain Optimization</MegaMenuItem>
                  <MegaMenuItem>Quality Control</MegaMenuItem>
                  <MegaMenuItem>Production Planning</MegaMenuItem>
                </MegaMenuGroup>
              </div>
              <MegaMenuLinkRow className="defaultBottomLinkRow">
                <Link href="#">Explore details</Link>
              </MegaMenuLinkRow>
            </MegaMenuSection>
          </MegaMenuContainer>
        </div>
      </MegaMenu>

      <MegaMenu
        open={openMenu === "bottom"}
        onOpenChange={(open) => setOpenMenu(open ? "bottom" : null)}
      >
        <div className="customRegionWrapper">
          <MegaMenuTrigger>
            <Button onClick={() => setOpenMenu("bottom")}>
              Custom Region on Bottom
            </Button>
          </MegaMenuTrigger>

          <MegaMenuContainer className="customRegionContainerColumn customRegionNoContainerPadding">
            <MegaMenuSection className="customRegionContainerColumn">
              <div className="customRegionTopBottomGroups">
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem>Digital Banking</MegaMenuItem>
                  <MegaMenuItem>Risk Management</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem>Patient Management</MegaMenuItem>
                  <MegaMenuItem>Telemedicine</MegaMenuItem>
                  <MegaMenuItem>Compliance Solutions</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem>E-Commerce Platforms</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem>Supply Chain Optimization</MegaMenuItem>
                  <MegaMenuItem>Quality Control</MegaMenuItem>
                  <MegaMenuItem>Production Planning</MegaMenuItem>
                </MegaMenuGroup>
              </div>
              <MegaMenuLinkRow className="defaultBottomLinkRow">
                <Link href="#">Explore details</Link>
              </MegaMenuLinkRow>
            </MegaMenuSection>
            <MegaMenuCustomRegion variant="tertiary">
              <FlexLayout direction={"column"} wrap gap={2}>
                <img
                  alt="example"
                  src={exampleImage2}
                  className="customRegionImage"
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0}>
                    <Text styleAs="h2">Featured Resource</Text>
                    <Text>
                      Explore our latest accessibility guidelines to ensure your
                      components meet ADA standards and provide an inclusive
                      user experience.
                    </Text>
                  </StackLayout>
                  <Link
                    color="primary"
                    underline="default"
                    target="_blank"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    View Guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuCustomRegion>
          </MegaMenuContainer>
        </div>
      </MegaMenu>
    </StackLayout>
  );
};

export const WithCustomRegion = WithCustomRegionTemplate.bind({});
