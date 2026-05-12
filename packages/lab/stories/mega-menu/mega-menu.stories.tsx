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
  MegaMenuContent,
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
import "./mega-menu.stories.css";

export default {
  title: "Lab/Mega Menu",
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: StoryFn) => (
      <div
        style={{
          padding: "var(--salt-layout-page-margin)",
          boxSizing: "border-box",
        }}
      >
        <Story />
      </div>
    ),
  ],
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
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Digital banking",
                      );
                    }}
                  >
                    <DevicesIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Risk management",
                      );
                    }}
                  >
                    <DatasetManagerIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Risk management</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Patient management",
                      );
                    }}
                  >
                    <UserSearchIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>
                      Patient management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Telemedicine");
                    }}
                  >
                    <CallIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Compliance solutions",
                      );
                    }}
                  >
                    <PasteIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>
                      Compliance solutions
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "E-commerce platforms",
                      );
                    }}
                  >
                    <CartIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>
                      E-commerce platforms
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Supply chain optimization",
                      );
                    }}
                  >
                    <LinkedIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>
                      Supply chain optimization
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Quality control",
                      );
                    }}
                  >
                    <SettingsIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Production planning",
                      );
                    }}
                  >
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
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Learning management systems",
                      );
                    }}
                  >
                    <GuideOpenIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>
                      Learning management systems
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Virtual classrooms",
                      );
                    }}
                  >
                    <LaptopIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>
                      Virtual classrooms
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Government</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Document management",
                      );
                    }}
                  >
                    <DocumentIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>
                      Document management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Citizen services",
                      );
                    }}
                  >
                    <PinIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Citizen services</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Public safety solutions",
                      );
                    }}
                  >
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
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Strategy");
                    }}
                  >
                    <ChartBubbleIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Strategy</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "IT");
                    }}
                  >
                    <LaptopIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>IT</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "HR");
                    }}
                  >
                    <UserGroupIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>HR</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Marketing");
                    }}
                  >
                    <MarkerIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Marketing</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Operations");
                    }}
                  >
                    <SettingsIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Operations</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Implementation</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Onboarding");
                    }}
                  >
                    <PasteIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Onboarding</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Migration");
                    }}
                  >
                    <SwapIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Migration</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Customization",
                      );
                    }}
                  >
                    <PinIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Customization</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Training");
                    }}
                  >
                    <GuideClosedIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Training</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Support");
                    }}
                  >
                    <InfoIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Support</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Testing");
                    }}
                  >
                    <MaintenanceIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Testing</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Rollout");
                    }}
                  >
                    <SaveIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Rollout</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Online");
                    }}
                  >
                    <DisplayIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Online</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "In-person");
                    }}
                  >
                    <UserIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>In-person</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Workshops");
                    }}
                  >
                    <KeyIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Workshops</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Certifications",
                      );
                    }}
                  >
                    <DocumentIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Certifications</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Tutorials");
                    }}
                  >
                    <DocumentEditIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Tutorials</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Guides");
                    }}
                  >
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
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "User guides");
                    }}
                  >
                    <GuideClosedIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>User guides</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "API reference",
                      );
                    }}
                  >
                    <ApiIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>API reference</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Release notes",
                      );
                    }}
                  >
                    <NotificationIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Release notes</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "FAQs");
                    }}
                  >
                    <HelpIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>FAQs</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & help</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Contact support",
                      );
                    }}
                  >
                    <InfoIcon aria-hidden className="saltMegaMenuItem-icon" />
                    <MegaMenuItemContent>Contact support</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Community forum",
                      );
                    }}
                  >
                    <ChatGroupIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    <MegaMenuItemContent>Community forum</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Troubleshooting",
                      );
                    }}
                  >
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
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Digital banking",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Patient management",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Patient management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Telemedicine");
                    }}
                  >
                    <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                    <div className="menu-item-adornment">
                      <Tag category={1} variant="primary">
                        Premium
                      </Tag>
                    </div>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Supply chain optimization",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Supply chain optimization
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Quality control",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Production planning",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Production planning
                    </MegaMenuItemContent>
                    <div className="menu-item-adornment">
                      <Tag category={2} variant="primary">
                        New
                      </Tag>
                    </div>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Education</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Learning management systems",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Learning management systems
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Document management",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Document management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Citizen services",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Citizen services</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
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

            <MegaMenuPanel aria-label="Services menu">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Consulting</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Strategy");
                    }}
                  >
                    <MegaMenuItemContent>Strategy</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "IT");
                    }}
                  >
                    <MegaMenuItemContent>IT</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "HR");
                    }}
                  >
                    <MegaMenuItemContent>HR</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Marketing");
                    }}
                  >
                    <MegaMenuItemContent>Marketing</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Operations");
                    }}
                  >
                    <MegaMenuItemContent>Operations</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Implementation</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Onboarding");
                    }}
                  >
                    <MegaMenuItemContent>Onboarding</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Migration");
                    }}
                  >
                    <MegaMenuItemContent>Migration</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Customization",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Customization</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Training");
                    }}
                  >
                    <MegaMenuItemContent>Training</MegaMenuItemContent>
                    <div className="menu-item-adornment">
                      {" "}
                      <Badge value="1" />
                    </div>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Support");
                    }}
                  >
                    <MegaMenuItemContent>Support</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Testing");
                    }}
                  >
                    <MegaMenuItemContent>Testing</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Rollout");
                    }}
                  >
                    <MegaMenuItemContent>Rollout</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Online");
                    }}
                  >
                    <MegaMenuItemContent>Online</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "In-person");
                    }}
                  >
                    <MegaMenuItemContent> In-person</MegaMenuItemContent>
                    <div className="menu-item-adornment">
                      {" "}
                      <Badge className="menu-item-adornment" />
                    </div>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Workshops");
                    }}
                  >
                    <MegaMenuItemContent>Workshops</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Certifications",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Certifications</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Tutorials");
                    }}
                  >
                    <MegaMenuItemContent>Tutorials</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Guides");
                    }}
                  >
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
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "User guides");
                    }}
                  >
                    <MegaMenuItemContent>User guides</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "API reference",
                      );
                    }}
                  >
                    <MegaMenuItemContent>API reference</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Release notes",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Release notes</MegaMenuItemContent>
                    <div className="menu-item-adornment">
                      <Badge />
                    </div>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "FAQs");
                    }}
                  >
                    <MegaMenuItemContent>FAQs</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & help</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Contact support",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Contact support</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Community forum",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Community forum</MegaMenuItemContent>
                    <div className="menu-item-adornment">
                      <Tag category={2} variant="primary">
                        New
                      </Tag>
                    </div>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Troubleshooting",
                      );
                    }}
                  >
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
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 1",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 1</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 2",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 2</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 3",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 3</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 4",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 4</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 5",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 5</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 6",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 6</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 7",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 7</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 8",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 8</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 9",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 9</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 10",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 10</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 11",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 11</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 12",
                    );
                  }}
                >
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
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 1",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 1</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 2",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 2</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 3",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 3</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 4",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 4</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 5",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 5</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 6",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 6</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 7",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 7</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 8",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 8</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 9",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 9</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 10",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 10</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 11",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 11</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 12",
                    );
                  }}
                >
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
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 1",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 1</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 2",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 2</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 3",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 3</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 4",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 4</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 5",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 5</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 6",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 6</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 7",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 7</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 8",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 8</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 9",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 9</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 10",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 10</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 11",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 11</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 12",
                    );
                  }}
                >
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
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 1",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 1</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 2",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 2</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 3",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 3</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 4",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 4</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 5",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 5</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 6",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 6</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 7",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 7</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 8",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 8</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 9",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 9</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 10",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 10</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 11",
                    );
                  }}
                >
                  <MegaMenuItemContent>Mega menu item 11</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[MegaMenu] selected value:",
                      "Mega menu item 12",
                    );
                  }}
                >
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
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleOpenChange = (menu: string) => (open: boolean) => {
    setOpenMenu(open ? menu : null);
    if (open) {
      setActiveMenu(menu);
    }
  };

  return (
    <div className="full-width-wrapper">
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
                aria-label="Solutions menu"
                className="full-width-panel"
              >
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Financial services</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Digital banking",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
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
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Patient management",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Patient management
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Telemedicine",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
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
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
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
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Supply chain optimization",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Supply chain optimization
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Quality control",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
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
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Learning management systems",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Learning management systems
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
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
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Document management",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Document management
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Citizen services",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Citizen services
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Public safety solutions",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Public safety solutions
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Technology</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Cloud solutions",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Cloud solutions</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Cybersecurity",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Cybersecurity</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Energy</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Smart Grid Management",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Smart Grid Management
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Renewable Integration",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Renewable Integration
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
                aria-label="Services menu"
                className="full-width-panel"
              >
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Consulting</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Strategy");
                      }}
                    >
                      <MegaMenuItemContent>Strategy</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "IT");
                      }}
                    >
                      <MegaMenuItemContent>IT</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "HR");
                      }}
                    >
                      <MegaMenuItemContent>HR</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Marketing");
                      }}
                    >
                      <MegaMenuItemContent>Marketing</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Operations");
                      }}
                    >
                      <MegaMenuItemContent>Operations</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Implementation</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Onboarding");
                      }}
                    >
                      <MegaMenuItemContent>Onboarding</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Migration");
                      }}
                    >
                      <MegaMenuItemContent>Migration</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Customization",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Customization</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Training");
                      }}
                    >
                      <MegaMenuItemContent>Training</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Support");
                      }}
                    >
                      <MegaMenuItemContent>Support</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Testing");
                      }}
                    >
                      <MegaMenuItemContent>Testing</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Rollout");
                      }}
                    >
                      <MegaMenuItemContent>Rollout</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Training</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Online");
                      }}
                    >
                      <DisplayIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "In-person");
                      }}
                    >
                      <MegaMenuItemContent>In-person</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Workshops");
                      }}
                    >
                      <MegaMenuItemContent>Workshops</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Certifications",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Certifications</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Tutorials");
                      }}
                    >
                      <MegaMenuItemContent>Tutorials</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Guides");
                      }}
                    >
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
              <MegaMenuPanel
                aria-label="Resources menu"
                className="full-width-panel"
              >
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Documentation</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "User guides",
                        );
                      }}
                    >
                      <MegaMenuItemContent>User guides</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "API reference",
                        );
                      }}
                    >
                      <MegaMenuItemContent>API reference</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Release notes",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Release notes</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "FAQs");
                      }}
                    >
                      <MegaMenuItemContent>FAQs</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Support &amp; help</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Contact support",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Contact support</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Community forum",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Community forum</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Troubleshooting",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Troubleshooting</MegaMenuItemContent>
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

FullWidthContainer.parameters = {
  layout: "fullscreen",
};

export const EdgeToEdge: StoryFn = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleOpenChange = (menu: string) => (open: boolean) => {
    setOpenMenu(open ? menu : null);
    if (open) {
      setActiveMenu(menu);
    }
  };

  return (
    <div className="edge-to-edge-wrapper">
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
                aria-label="Solutions menu"
                className="max-width-content-panel"
              >
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Financial services</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Digital banking",
                        );
                      }}
                    >
                      <DevicesIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Risk management",
                        );
                      }}
                    >
                      <DatasetManagerIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>Risk management</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Healthcare</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Patient management",
                        );
                      }}
                    >
                      <UserSearchIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>
                        Patient management
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Telemedicine",
                        );
                      }}
                    >
                      <CallIcon aria-hidden className="saltMegaMenuItem-icon" />
                      <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Compliance solutions",
                        );
                      }}
                    >
                      <PasteIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>
                        Compliance solutions
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Retail</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "E-commerce platforms",
                        );
                      }}
                    >
                      <CartIcon aria-hidden className="saltMegaMenuItem-icon" />
                      <MegaMenuItemContent>
                        E-commerce platforms
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Supply chain optimization",
                        );
                      }}
                    >
                      <LinkedIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>
                        Supply chain optimization
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Quality control",
                        );
                      }}
                    >
                      <SettingsIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Production planning",
                        );
                      }}
                    >
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
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Learning management systems",
                        );
                      }}
                    >
                      <GuideOpenIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>
                        Learning management systems
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Virtual classrooms",
                        );
                      }}
                    >
                      <LaptopIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>
                        Virtual classrooms
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Government</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Document management",
                        );
                      }}
                    >
                      <DocumentIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>
                        Document management
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Citizen services",
                        );
                      }}
                    >
                      <PinIcon aria-hidden className="saltMegaMenuItem-icon" />
                      <MegaMenuItemContent>
                        Citizen services
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Public safety solutions",
                        );
                      }}
                    >
                      <UserGroupIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>
                        Public safety solutions
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Technology</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Cloud solutions",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Cloud solutions</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Cybersecurity",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Cybersecurity</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Energy</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Smart Grid Management",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Smart Grid Management
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Renewable Integration",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Renewable Integration
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
                aria-label="Services menu"
                className="max-width-content-panel"
              >
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Consulting</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Strategy");
                      }}
                    >
                      <MegaMenuItemContent>Strategy</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "IT");
                      }}
                    >
                      <MegaMenuItemContent>IT</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "HR");
                      }}
                    >
                      <MegaMenuItemContent>HR</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Marketing");
                      }}
                    >
                      <MegaMenuItemContent>Marketing</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Operations");
                      }}
                    >
                      <MegaMenuItemContent>Operations</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Implementation</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Onboarding");
                      }}
                    >
                      <MegaMenuItemContent>Onboarding</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Migration");
                      }}
                    >
                      <MegaMenuItemContent>Migration</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Customization",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Customization</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Training");
                      }}
                    >
                      <MegaMenuItemContent>Training</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Support");
                      }}
                    >
                      <MegaMenuItemContent>Support</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Testing");
                      }}
                    >
                      <MegaMenuItemContent>Testing</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Rollout");
                      }}
                    >
                      <MegaMenuItemContent>Rollout</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Training</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Online");
                      }}
                    >
                      <MegaMenuItemContent>Online</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "In-person");
                      }}
                    >
                      <MegaMenuItemContent>In-person</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Workshops");
                      }}
                    >
                      <MegaMenuItemContent>Workshops</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Certifications",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Certifications</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Tutorials");
                      }}
                    >
                      <MegaMenuItemContent>Tutorials</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Guides");
                      }}
                    >
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
              <MegaMenuPanel
                aria-label="Resources menu"
                className="max-width-content-panel"
              >
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Documentation</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "User guides",
                        );
                      }}
                    >
                      <MegaMenuItemContent>User guides</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "API reference",
                        );
                      }}
                    >
                      <MegaMenuItemContent>API reference</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Release notes",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Release notes</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "FAQs");
                      }}
                    >
                      <MegaMenuItemContent>FAQs</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Support &amp; help</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Contact support",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Contact support</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Community forum",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Community forum</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Troubleshooting",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Troubleshooting</MegaMenuItemContent>
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

EdgeToEdge.parameters = {
  layout: "fullscreen",
};

export const WithContent: StoryFn = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <StackLayout direction="column" gap={2}>
      <MegaMenu
        open={openMenu === "right"}
        onOpenChange={(open) => setOpenMenu(open ? "right" : null)}
      >
        <div className="custom-region-wrapper">
          <MegaMenuTrigger>
            <Button>Content on right</Button>
          </MegaMenuTrigger>
          <MegaMenuPanel className="custom-region-no-container-padding custom-region-side">
            <div className="custom-region-content">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial services</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Digital banking",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Patient management",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Patient management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Telemedicine");
                    }}
                  >
                    <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Supply chain optimization",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Supply chain optimization
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Quality control",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Production planning",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Production planning
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <FlexLayout gap={3}>
                <MegaMenuGroup className="link-footer-spacing-first-link">
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    Book a demo
                  </Link>
                </MegaMenuGroup>
                <MegaMenuGroup>
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
            </div>
            <MegaMenuContent className="custom-region-tertiary">
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
                    style={{ width: "fit-content" }}
                  >
                    View guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuContent>
          </MegaMenuPanel>
        </div>
      </MegaMenu>

      <MegaMenu
        open={openMenu === "left"}
        onOpenChange={(open) => setOpenMenu(open ? "left" : null)}
      >
        <div className="custom-region-wrapper">
          <MegaMenuTrigger>
            <Button>Content on left</Button>
          </MegaMenuTrigger>

          <MegaMenuPanel className="custom-region-no-container-padding custom-region-side">
            <MegaMenuContent className="custom-region-secondary">
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
                    style={{ width: "fit-content" }}
                  >
                    View guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuContent>
            <div className="custom-region-content">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial services</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Digital banking",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Patient management",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Patient management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Telemedicine");
                    }}
                  >
                    <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Supply chain optimization",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Supply chain optimization
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Quality control",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Production planning",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Production planning
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <FlexLayout gap={3}>
                <MegaMenuGroup className="link-footer-spacing-first-link">
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    Book a demo
                  </Link>
                </MegaMenuGroup>
                <MegaMenuGroup>
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
            </div>
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Digital banking",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
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
                    onClick={(event) => {
                      event.preventDefault();
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Telemedicine",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
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
                    onClick={(event) => {
                      event.preventDefault();
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
                    onClick={(event) => {
                      event.preventDefault();
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Quality control",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
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
                    onClick={(event) => {
                      event.preventDefault();
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
                    onClick={(event) => {
                      event.preventDefault();
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
                    onClick={(event) => {
                      event.preventDefault();
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Citizen services",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Citizen services</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
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
                <MegaMenuGroup className="link-footer-spacing-first-link">
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    Book a demo
                  </Link>
                </MegaMenuGroup>
                <MegaMenuGroup className="link-footer-spacing-multi-link">
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Strategy",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Strategy</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[WithLink MegaMenu] selected value:", "IT");
                    }}
                  >
                    <MegaMenuItemContent>IT</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[WithLink MegaMenu] selected value:", "HR");
                    }}
                  >
                    <MegaMenuItemContent>HR</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Marketing",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Marketing</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Onboarding",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Onboarding</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Migration",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Migration</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Customization",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Customization</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Training",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Training</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Support",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Support</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Testing",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Testing</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Online",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Online</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "In-person",
                      );
                    }}
                  >
                    <MegaMenuItemContent>In-person</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Workshops",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Workshops</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Certifications",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Certifications</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Tutorials",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Tutorials</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "User guides",
                      );
                    }}
                  >
                    <MegaMenuItemContent>User guides</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "API reference",
                      );
                    }}
                  >
                    <MegaMenuItemContent>API reference</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Release notes",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Release notes</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Contact support",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Contact support</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Community forum",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Community forum</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
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
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Digital banking",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
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
                      onClick={(event) => {
                        event.preventDefault();
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
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Telemedicine",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
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
                      onClick={(event) => {
                        event.preventDefault();
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
                      onClick={(event) => {
                        event.preventDefault();
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
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Quality control",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
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
                      onClick={(event) => {
                        event.preventDefault();
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
                      onClick={(event) => {
                        event.preventDefault();
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
                      onClick={(event) => {
                        event.preventDefault();
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
                      onClick={(event) => {
                        event.preventDefault();
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
                      onClick={(event) => {
                        event.preventDefault();
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
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Strategy");
                      }}
                    >
                      <MegaMenuItemContent>Strategy</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "IT");
                      }}
                    >
                      <MegaMenuItemContent>IT</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "HR");
                      }}
                    >
                      <MegaMenuItemContent>HR</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Marketing");
                      }}
                    >
                      <MegaMenuItemContent>Marketing</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Operations");
                      }}
                    >
                      <MegaMenuItemContent>Operations</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Implementation</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Onboarding");
                      }}
                    >
                      <MegaMenuItemContent>Onboarding</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Migration");
                      }}
                    >
                      <MegaMenuItemContent>Migration</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Customization",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Customization</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Training");
                      }}
                    >
                      <MegaMenuItemContent>Training</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Support");
                      }}
                    >
                      <MegaMenuItemContent>Support</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Training</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Online");
                      }}
                    >
                      <MegaMenuItemContent>Online</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "In-person");
                      }}
                    >
                      <MegaMenuItemContent>In-person</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Workshops");
                      }}
                    >
                      <MegaMenuItemContent>Workshops</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Certifications",
                        );
                      }}
                    >
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
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "User guides",
                        );
                      }}
                    >
                      <MegaMenuItemContent>User guides</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "API reference",
                        );
                      }}
                    >
                      <MegaMenuItemContent>API reference</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Release notes",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Release notes</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "FAQs");
                      }}
                    >
                      <MegaMenuItemContent>FAQs</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Support</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Contact support",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Contact support</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Community forum",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Community forum</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Troubleshooting",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Troubleshooting</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Learn</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Tutorials");
                      }}
                    >
                      <MegaMenuItemContent>Tutorials</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Guides");
                      }}
                    >
                      <MegaMenuItemContent>Guides</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[MegaMenu] selected value:",
                          "Best practices",
                        );
                      }}
                    >
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
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Digital banking",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "Patient management",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Patient management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Telemedicine");
                    }}
                  >
                    <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
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
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[MegaMenu] selected value:",
                        "E-commerce platforms",
                      );
                    }}
                  >
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
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log("[MegaMenu] selected value:", "Item 1");
                  }}
                >
                  <MegaMenuItemContent>Item 1</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log("[MegaMenu] selected value:", "Item 2");
                  }}
                >
                  <MegaMenuItemContent>Item 2</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log("[MegaMenu] selected value:", "Item 3");
                  }}
                >
                  <MegaMenuItemContent>Item 3</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Group B</MegaMenuHeader>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log("[MegaMenu] selected value:", "Item 4");
                  }}
                >
                  <MegaMenuItemContent>Item 4</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log("[MegaMenu] selected value:", "Item 5");
                  }}
                >
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
