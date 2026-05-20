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
                    Digital banking
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
                    Risk management
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
                    Patient management
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Telemedicine");
                    }}
                  >
                    <CallIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Telemedicine
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
                    Compliance solutions
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
                    E-commerce platforms
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
                    Supply chain optimization
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
                    Quality control
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
                    Production planning
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
                    Learning management systems
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
                    Virtual classrooms
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
                    Document management
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
                    Citizen services
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
                    Public safety solutions
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
                    Strategy
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "IT");
                    }}
                  >
                    <LaptopIcon aria-hidden className="saltMegaMenuItem-icon" />
                    IT
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
                    HR
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Marketing");
                    }}
                  >
                    <MarkerIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Marketing
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
                    Operations
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
                    Onboarding
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Migration");
                    }}
                  >
                    <SwapIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Migration
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
                    Customization
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
                    Training
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Support");
                    }}
                  >
                    <InfoIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Support
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
                    Testing
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Rollout");
                    }}
                  >
                    <SaveIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Rollout
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
                    Online
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "In-person");
                    }}
                  >
                    <UserIcon aria-hidden className="saltMegaMenuItem-icon" />
                    In-person
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Workshops");
                    }}
                  >
                    <KeyIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Workshops
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
                    Certifications
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
                    Tutorials
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
                    Guides
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
                    User guides
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
                    API reference
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
                    Release notes
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "FAQs");
                    }}
                  >
                    <HelpIcon aria-hidden className="saltMegaMenuItem-icon" />
                    FAQs
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
                    Contact support
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
                    Community forum
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
                    Troubleshooting
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
                    Digital banking
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
                    Risk management
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
                    Patient management
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Telemedicine");
                    }}
                  >
                    Telemedicine
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
                    Compliance solutions
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
                    E-commerce platforms
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
                    Supply chain optimization
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
                    Quality control
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
                    Production planning
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
                    Learning management systems
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
                    Virtual classrooms
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
                    Document management
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
                    Citizen services
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
                    Public safety solutions
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
                    Strategy
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "IT");
                    }}
                  >
                    IT
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "HR");
                    }}
                  >
                    HR
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Marketing");
                    }}
                  >
                    Marketing
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Operations");
                    }}
                  >
                    Operations
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
                    Onboarding
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Migration");
                    }}
                  >
                    Migration
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
                    Customization
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Training");
                    }}
                  >
                    Training
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
                    Support
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Testing");
                    }}
                  >
                    Testing
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Rollout");
                    }}
                  >
                    Rollout
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
                    Online
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "In-person");
                    }}
                  >
                    In-person
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
                    Workshops
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
                    Certifications
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Tutorials");
                    }}
                  >
                    Tutorials
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Guides");
                    }}
                  >
                    Guides
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
                    User guides
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
                    API reference
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
                    Release notes
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
                    FAQs
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
                    Contact support
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
                    Community forum
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
                    Troubleshooting
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
                  Mega menu item 1
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
                  Mega menu item 2
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
                  Mega menu item 3
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
                  Mega menu item 4
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
                  Mega menu item 5
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
                  Mega menu item 6
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
                  Mega menu item 7
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
                  Mega menu item 8
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
                  Mega menu item 9
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
                  Mega menu item 10
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
                  Mega menu item 11
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
                  Mega menu item 12
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
                  Mega menu item 1
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
                  Mega menu item 2
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
                  Mega menu item 3
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
                  Mega menu item 4
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
                  Mega menu item 5
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
                  Mega menu item 6
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
                  Mega menu item 7
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
                  Mega menu item 8
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
                  Mega menu item 9
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
                  Mega menu item 10
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
                  Mega menu item 11
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
                  Mega menu item 12
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
                  Mega menu item 1
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
                  Mega menu item 2
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
                  Mega menu item 3
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
                  Mega menu item 4
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
                  Mega menu item 5
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
                  Mega menu item 6
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
                  Mega menu item 7
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
                  Mega menu item 8
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
                  Mega menu item 9
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
                  Mega menu item 10
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
                  Mega menu item 11
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
                  Mega menu item 12
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
                  Mega menu item 1
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
                  Mega menu item 2
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
                  Mega menu item 3
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
                  Mega menu item 4
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
                  Mega menu item 5
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
                  Mega menu item 6
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
                  Mega menu item 7
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
                  Mega menu item 8
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
                  Mega menu item 9
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
                  Mega menu item 10
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
                  Mega menu item 11
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
                  Mega menu item 12
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
                      Digital banking
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
                      Risk management
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
                      Patient management
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
                      Telemedicine
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
                      Compliance solutions
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
                      E-commerce platforms
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
                      Supply chain optimization
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
                      Quality control
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
                      Production planning
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
                      Learning management systems
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
                      Virtual classrooms
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
                      Document management
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
                      Citizen services
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
                      Public safety solutions
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
                      Cloud solutions
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
                      Cybersecurity
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
                      Smart Grid Management
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
                      Renewable Integration
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
                      Strategy
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "IT");
                      }}
                    >
                      IT
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "HR");
                      }}
                    >
                      HR
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Marketing");
                      }}
                    >
                      Marketing
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Operations");
                      }}
                    >
                      Operations
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
                      Onboarding
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Migration");
                      }}
                    >
                      Migration
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
                      Customization
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Training");
                      }}
                    >
                      Training
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Support");
                      }}
                    >
                      Support
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Testing");
                      }}
                    >
                      Testing
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Rollout");
                      }}
                    >
                      Rollout
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
                      In-person
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Workshops");
                      }}
                    >
                      Workshops
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
                      Certifications
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Tutorials");
                      }}
                    >
                      Tutorials
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Guides");
                      }}
                    >
                      Guides
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
                      User guides
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
                      API reference
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
                      Release notes
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "FAQs");
                      }}
                    >
                      FAQs
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
                      Contact support
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
                      Community forum
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
                      Troubleshooting
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
                      Digital banking
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
                      Risk management
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
                      Patient management
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
                      Telemedicine
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
                      Compliance solutions
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
                      E-commerce platforms
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
                      Supply chain optimization
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
                      Quality control
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
                      Production planning
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
                      Learning management systems
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
                      Virtual classrooms
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
                      Document management
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
                      Citizen services
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
                      Public safety solutions
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
                      Cloud solutions
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
                      Cybersecurity
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
                      Smart Grid Management
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
                      Renewable Integration
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
                      Strategy
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "IT");
                      }}
                    >
                      IT
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "HR");
                      }}
                    >
                      HR
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Marketing");
                      }}
                    >
                      Marketing
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Operations");
                      }}
                    >
                      Operations
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
                      Onboarding
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Migration");
                      }}
                    >
                      Migration
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
                      Customization
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Training");
                      }}
                    >
                      Training
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Support");
                      }}
                    >
                      Support
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Testing");
                      }}
                    >
                      Testing
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Rollout");
                      }}
                    >
                      Rollout
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
                      Online
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "In-person");
                      }}
                    >
                      In-person
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Workshops");
                      }}
                    >
                      Workshops
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
                      Certifications
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Tutorials");
                      }}
                    >
                      Tutorials
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Guides");
                      }}
                    >
                      Guides
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
                      User guides
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
                      API reference
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
                      Release notes
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "FAQs");
                      }}
                    >
                      FAQs
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
                      Contact support
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
                      Community forum
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
                      Troubleshooting
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
    <FlexLayout gap={2}>
      <MegaMenu
        open={openMenu === "right"}
        onOpenChange={(open) => setOpenMenu(open ? "right" : null)}
      >
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
                  Digital banking
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
                  Risk management
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
                  Patient management
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log("[MegaMenu] selected value:", "Telemedicine");
                  }}
                >
                  Telemedicine
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
                  Compliance solutions
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
                  E-commerce platforms
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
                  Supply chain optimization
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
                  Quality control
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
                  Production planning
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuSection>
            <FlexLayout gap={3}>
              <MegaMenuContent className="link-footer-spacing-first-link">
                <Link
                  color="primary"
                  underline="default"
                  href="#link"
                  IconComponent={ChevronRightIcon}
                >
                  Book a demo
                </Link>
              </MegaMenuContent>
              <MegaMenuContent className="link-footer-spacing-multi-link">
                <Link
                  color="primary"
                  underline="default"
                  href="#link"
                  IconComponent={ChevronRightIcon}
                >
                  Support center
                </Link>
              </MegaMenuContent>
            </FlexLayout>
          </div>
          <MegaMenuContent className="custom-region">
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
                    components meet ADA standards and provide an inclusive user
                    experience.
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
      </MegaMenu>

      <MegaMenu
        open={openMenu === "left"}
        onOpenChange={(open) => setOpenMenu(open ? "left" : null)}
      >
        <MegaMenuTrigger>
          <Button>Content on left</Button>
        </MegaMenuTrigger>
        <MegaMenuPanel className="custom-region-no-container-padding custom-region-side">
          <MegaMenuContent className="custom-region">
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
                    components meet ADA standards and provide an inclusive user
                    experience.
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
                  Digital banking
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
                  Risk management
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
                  Patient management
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log("[MegaMenu] selected value:", "Telemedicine");
                  }}
                >
                  Telemedicine
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
                  Compliance solutions
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
                  E-commerce platforms
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
                  Supply chain optimization
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
                  Quality control
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
                  Production planning
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuSection>
            <FlexLayout gap={3}>
              <MegaMenuContent className="link-footer-spacing-first-link">
                <Link
                  color="primary"
                  underline="default"
                  href="#link"
                  IconComponent={ChevronRightIcon}
                >
                  Book a demo
                </Link>
              </MegaMenuContent>
              <MegaMenuContent className="link-footer-spacing-multi-link">
                <Link
                  color="primary"
                  underline="default"
                  href="#link"
                  IconComponent={ChevronRightIcon}
                >
                  Support center
                </Link>
              </MegaMenuContent>
            </FlexLayout>
          </div>
        </MegaMenuPanel>
      </MegaMenu>
    </FlexLayout>
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
                    Digital banking
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
                    Risk management
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
                    Patient management
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
                    Telemedicine
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
                    Compliance solutions
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
                    E-commerce platforms
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
                    Supply chain optimization
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
                    Quality control
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
                    Production planning
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
                    Learning management systems
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
                    Virtual classrooms
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
                    Document management
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
                    Citizen services
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
                    Public safety solutions
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <FlexLayout wrap gap={3}>
                <MegaMenuContent className="link-footer-spacing-first-link">
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    Book a demo
                  </Link>
                </MegaMenuContent>
                <MegaMenuContent className="link-footer-spacing-multi-link">
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    Support center
                  </Link>
                </MegaMenuContent>
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
                    Strategy
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[WithLink MegaMenu] selected value:", "IT");
                    }}
                  >
                    IT
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[WithLink MegaMenu] selected value:", "HR");
                    }}
                  >
                    HR
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
                    Marketing
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
                    Operations
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
                    Onboarding
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
                    Migration
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
                    Customization
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
                    Training
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
                    Support
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
                    Testing
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
                    Rollout
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
                    Online
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
                    In-person
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
                    Workshops
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
                    Certifications
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
                    Tutorials
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
                    Guides
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <MegaMenuContent className="link-footer-spacing">
                <Link
                  color="primary"
                  underline="default"
                  href="#link"
                  IconComponent={ChevronRightIcon}
                >
                  Service status
                </Link>
              </MegaMenuContent>
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
                    User guides
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
                    API reference
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
                    Release notes
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
                    FAQs
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
                    Contact support
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
                    Community forum
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
                    Troubleshooting
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <MegaMenuContent className="link-footer-spacing">
                <Link
                  color="primary"
                  underline="default"
                  href="#link"
                  IconComponent={ChevronRightIcon}
                >
                  Browse documentation
                </Link>
              </MegaMenuContent>
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
                      Digital banking
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
                      Risk management
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
                      Patient management
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
                      Telemedicine
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
                      Compliance solutions
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
                      E-commerce platforms
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
                      Supply chain optimization
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
                      Quality control
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
                      Production planning
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
                      Learning management systems
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
                      Virtual classrooms
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
                      Document management
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
                      Citizen services
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
                      Public safety solutions
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
                      Strategy
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "IT");
                      }}
                    >
                      IT
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "HR");
                      }}
                    >
                      HR
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Marketing");
                      }}
                    >
                      Marketing
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Operations");
                      }}
                    >
                      Operations
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
                      Onboarding
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Migration");
                      }}
                    >
                      Migration
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
                      Customization
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Training");
                      }}
                    >
                      Training
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Support");
                      }}
                    >
                      Support
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
                      Online
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "In-person");
                      }}
                    >
                      In-person
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Workshops");
                      }}
                    >
                      Workshops
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
                      Certifications
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
                      User guides
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
                      API reference
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
                      Release notes
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "FAQs");
                      }}
                    >
                      FAQs
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
                      Contact support
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
                      Community forum
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
                      Troubleshooting
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
                      Tutorials
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log("[MegaMenu] selected value:", "Guides");
                      }}
                    >
                      Guides
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
                      Best practices
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
                    Digital banking
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
                    Risk management
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
                    Patient management
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[MegaMenu] selected value:", "Telemedicine");
                    }}
                  >
                    Telemedicine
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
                    Compliance solutions
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
                    E-commerce platforms
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
                  Item 1
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log("[MegaMenu] selected value:", "Item 2");
                  }}
                >
                  Item 2
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log("[MegaMenu] selected value:", "Item 3");
                  }}
                >
                  Item 3
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
                  Item 4
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log("[MegaMenu] selected value:", "Item 5");
                  }}
                >
                  Item 5
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuSection>
          </MegaMenuPanel>
        </MegaMenu>
      ))}
    </StackLayout>
  );
};
