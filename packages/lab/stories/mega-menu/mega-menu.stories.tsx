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
import { MemoryRouter, Link as RouterLink } from "react-router";

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
        <MemoryRouter>
          <Story />
        </MemoryRouter>
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
                    render={<RouterLink to="/digital-banking" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/digital-banking")
                    }
                  >
                    <DevicesIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    Digital banking
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/risk-management" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/risk-management")
                    }
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
                    render={<RouterLink to="/patient-management" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/patient-management",
                      )
                    }
                  >
                    <UserSearchIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    Patient management
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/telemedicine" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/telemedicine")
                    }
                  >
                    <CallIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Telemedicine
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/compliance-solutions" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/compliance-solutions",
                      )
                    }
                  >
                    <PasteIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Compliance solutions
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/e-commerce-platforms" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/e-commerce-platforms",
                      )
                    }
                  >
                    <CartIcon aria-hidden className="saltMegaMenuItem-icon" />
                    E-commerce platforms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/supply-chain-optimization" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/supply-chain-optimization",
                      )
                    }
                  >
                    <LinkedIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Supply chain optimization
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/quality-control" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/quality-control")
                    }
                  >
                    <SettingsIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    Quality control
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/production-planning" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/production-planning",
                      )
                    }
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
                    render={<RouterLink to="/learning-management-systems" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/learning-management-systems",
                      )
                    }
                  >
                    <GuideOpenIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    Learning management systems
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/virtual-classrooms" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/virtual-classrooms",
                      )
                    }
                  >
                    <LaptopIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Virtual classrooms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Government</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/document-management" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/document-management",
                      )
                    }
                  >
                    <DocumentIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    Document management
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/citizen-services" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/citizen-services")
                    }
                  >
                    <PinIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Citizen services
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/public-safety-solutions" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/public-safety-solutions",
                      )
                    }
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
                    render={<RouterLink to="/strategy" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/strategy")
                    }
                  >
                    <ChartBubbleIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    Strategy
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/it" />}
                    onClick={() => console.log("MegaMenuItem clicked:", "/it")}
                  >
                    <LaptopIcon aria-hidden className="saltMegaMenuItem-icon" />
                    IT
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/hr" />}
                    onClick={() => console.log("MegaMenuItem clicked:", "/hr")}
                  >
                    <UserGroupIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    HR
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/marketing" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/marketing")
                    }
                  >
                    <MarkerIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Marketing
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/operations" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/operations")
                    }
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
                    render={<RouterLink to="/onboarding" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/onboarding")
                    }
                  >
                    <PasteIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Onboarding
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/migration" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/migration")
                    }
                  >
                    <SwapIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Migration
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/customization" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/customization")
                    }
                  >
                    <PinIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Customization
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/training" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/training")
                    }
                  >
                    <GuideClosedIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    Training
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/support" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/support")
                    }
                  >
                    <InfoIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Support
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/testing" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/testing")
                    }
                  >
                    <MaintenanceIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    Testing
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/rollout" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/rollout")
                    }
                  >
                    <SaveIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Rollout
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/online" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/online")
                    }
                  >
                    <DisplayIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    Online
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/in-person" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/in-person")
                    }
                  >
                    <UserIcon aria-hidden className="saltMegaMenuItem-icon" />
                    In-person
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/workshops" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/workshops")
                    }
                  >
                    <KeyIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Workshops
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/certifications" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/certifications")
                    }
                  >
                    <DocumentIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    Certifications
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/tutorials" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/tutorials")
                    }
                  >
                    <DocumentEditIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    Tutorials
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/guides" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/guides")
                    }
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
                    render={<RouterLink to="/user-guides" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/user-guides")
                    }
                  >
                    <GuideClosedIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    User guides
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/api-reference" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/api-reference")
                    }
                  >
                    <ApiIcon aria-hidden className="saltMegaMenuItem-icon" />
                    API reference
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/release-notes" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/release-notes")
                    }
                  >
                    <NotificationIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    Release notes
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/faqs" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/faqs")
                    }
                  >
                    <HelpIcon aria-hidden className="saltMegaMenuItem-icon" />
                    FAQs
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & help</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/contact-support" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/contact-support")
                    }
                  >
                    <InfoIcon aria-hidden className="saltMegaMenuItem-icon" />
                    Contact support
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/community-forum" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/community-forum")
                    }
                  >
                    <ChatGroupIcon
                      aria-hidden
                      className="saltMegaMenuItem-icon"
                    />
                    Community forum
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/troubleshooting" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/troubleshooting")
                    }
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
                    render={<RouterLink to="/digital-banking" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/digital-banking")
                    }
                  >
                    Digital banking
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/risk-management" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/risk-management")
                    }
                  >
                    Risk management
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/patient-management" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/patient-management",
                      )
                    }
                  >
                    Patient management
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/telemedicine" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/telemedicine")
                    }
                  >
                    Telemedicine
                    <div className="menu-item-adornment">
                      <Tag category={1} variant="primary">
                        Premium
                      </Tag>
                    </div>
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/compliance-solutions" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/compliance-solutions",
                      )
                    }
                  >
                    Compliance solutions
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/e-commerce-platforms" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/e-commerce-platforms",
                      )
                    }
                  >
                    E-commerce platforms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/supply-chain-optimization" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/supply-chain-optimization",
                      )
                    }
                  >
                    Supply chain optimization
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/quality-control" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/quality-control")
                    }
                  >
                    Quality control
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/production-planning" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/production-planning",
                      )
                    }
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
                    render={<RouterLink to="/learning-management-systems" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/learning-management-systems",
                      )
                    }
                  >
                    Learning management systems
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/virtual-classrooms" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/virtual-classrooms",
                      )
                    }
                  >
                    Virtual classrooms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Government</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/document-management" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/document-management",
                      )
                    }
                  >
                    Document management
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/citizen-services" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/citizen-services")
                    }
                  >
                    Citizen services
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/public-safety-solutions" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/public-safety-solutions",
                      )
                    }
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
                    render={<RouterLink to="/strategy" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/strategy")
                    }
                  >
                    Strategy
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/it" />}
                    onClick={() => console.log("MegaMenuItem clicked:", "/it")}
                  >
                    IT
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/hr" />}
                    onClick={() => console.log("MegaMenuItem clicked:", "/hr")}
                  >
                    HR
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/marketing" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/marketing")
                    }
                  >
                    Marketing
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/operations" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/operations")
                    }
                  >
                    Operations
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Implementation</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/onboarding" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/onboarding")
                    }
                  >
                    Onboarding
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/migration" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/migration")
                    }
                  >
                    Migration
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/customization" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/customization")
                    }
                  >
                    Customization
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/training" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/training")
                    }
                  >
                    Training
                    <div className="menu-item-adornment">
                      {" "}
                      <Badge value="1" />
                    </div>
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/support" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/support")
                    }
                  >
                    Support
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/testing" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/testing")
                    }
                  >
                    Testing
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/rollout" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/rollout")
                    }
                  >
                    Rollout
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/online" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/online")
                    }
                  >
                    Online
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/in-person" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/in-person")
                    }
                  >
                    In-person
                    <div className="menu-item-adornment">
                      {" "}
                      <Badge className="menu-item-adornment" />
                    </div>
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/workshops" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/workshops")
                    }
                  >
                    Workshops
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/certifications" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/certifications")
                    }
                  >
                    Certifications
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/tutorials" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/tutorials")
                    }
                  >
                    Tutorials
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/guides" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/guides")
                    }
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
                    render={<RouterLink to="/user-guides" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/user-guides")
                    }
                  >
                    User guides
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/api-reference" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/api-reference")
                    }
                  >
                    API reference
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/release-notes" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/release-notes")
                    }
                  >
                    Release notes
                    <div className="menu-item-adornment">
                      <Badge />
                    </div>
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/faqs" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/faqs")
                    }
                  >
                    FAQs
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & help</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/contact-support" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/contact-support")
                    }
                  >
                    Contact support
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/community-forum" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/community-forum")
                    }
                  >
                    Community forum
                    <div className="menu-item-adornment">
                      <Tag category={2} variant="primary">
                        New
                      </Tag>
                    </div>
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/troubleshooting" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/troubleshooting")
                    }
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
                  render={<RouterLink to="/mega-menu-item-1" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-1")
                  }
                >
                  Mega menu item 1
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-2" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-2")
                  }
                >
                  Mega menu item 2
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-3" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-3")
                  }
                >
                  Mega menu item 3
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-4" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-4")
                  }
                >
                  Mega menu item 4
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-5" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-5")
                  }
                >
                  Mega menu item 5
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-6" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-6")
                  }
                >
                  Mega menu item 6
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-7" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-7")
                  }
                >
                  Mega menu item 7
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-8" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-8")
                  }
                >
                  Mega menu item 8
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-9" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-9")
                  }
                >
                  Mega menu item 9
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-10" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-10")
                  }
                >
                  Mega menu item 10
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-11" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-11")
                  }
                >
                  Mega menu item 11
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-12" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-12")
                  }
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
                  render={<RouterLink to="/mega-menu-item-1" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-1")
                  }
                >
                  Mega menu item 1
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-2" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-2")
                  }
                >
                  Mega menu item 2
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-3" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-3")
                  }
                >
                  Mega menu item 3
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-4" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-4")
                  }
                >
                  Mega menu item 4
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-5" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-5")
                  }
                >
                  Mega menu item 5
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-6" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-6")
                  }
                >
                  Mega menu item 6
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-7" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-7")
                  }
                >
                  Mega menu item 7
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-8" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-8")
                  }
                >
                  Mega menu item 8
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-9" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-9")
                  }
                >
                  Mega menu item 9
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-10" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-10")
                  }
                >
                  Mega menu item 10
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-11" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-11")
                  }
                >
                  Mega menu item 11
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-12" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-12")
                  }
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
                  render={<RouterLink to="/mega-menu-item-1" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-1")
                  }
                >
                  Mega menu item 1
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-2" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-2")
                  }
                >
                  Mega menu item 2
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-3" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-3")
                  }
                >
                  Mega menu item 3
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-4" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-4")
                  }
                >
                  Mega menu item 4
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-5" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-5")
                  }
                >
                  Mega menu item 5
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-6" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-6")
                  }
                >
                  Mega menu item 6
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-7" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-7")
                  }
                >
                  Mega menu item 7
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-8" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-8")
                  }
                >
                  Mega menu item 8
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-9" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-9")
                  }
                >
                  Mega menu item 9
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-10" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-10")
                  }
                >
                  Mega menu item 10
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-11" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-11")
                  }
                >
                  Mega menu item 11
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-12" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-12")
                  }
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
                  render={<RouterLink to="/mega-menu-item-1" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-1")
                  }
                >
                  Mega menu item 1
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-2" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-2")
                  }
                >
                  Mega menu item 2
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-3" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-3")
                  }
                >
                  Mega menu item 3
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-4" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-4")
                  }
                >
                  Mega menu item 4
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-5" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-5")
                  }
                >
                  Mega menu item 5
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-6" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-6")
                  }
                >
                  Mega menu item 6
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-7" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-7")
                  }
                >
                  Mega menu item 7
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-8" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-8")
                  }
                >
                  Mega menu item 8
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-9" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-9")
                  }
                >
                  Mega menu item 9
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-10" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-10")
                  }
                >
                  Mega menu item 10
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-11" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-11")
                  }
                >
                  Mega menu item 11
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/mega-menu-item-12" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/mega-menu-item-12")
                  }
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
                      render={<RouterLink to="/digital-banking" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/digital-banking")
                      }
                    >
                      Digital banking
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/risk-management" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/risk-management")
                      }
                    >
                      Risk management
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Healthcare</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/patient-management" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/patient-management",
                        )
                      }
                    >
                      Patient management
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/telemedicine" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/telemedicine")
                      }
                    >
                      Telemedicine
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/compliance-solutions" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/compliance-solutions",
                        )
                      }
                    >
                      Compliance solutions
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Retail</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/e-commerce-platforms" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/e-commerce-platforms",
                        )
                      }
                    >
                      E-commerce platforms
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/supply-chain-optimization" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/supply-chain-optimization",
                        )
                      }
                    >
                      Supply chain optimization
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/quality-control" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/quality-control")
                      }
                    >
                      Quality control
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/production-planning" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/production-planning",
                        )
                      }
                    >
                      Production planning
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Education</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/learning-management-systems" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/learning-management-systems",
                        )
                      }
                    >
                      Learning management systems
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/virtual-classrooms" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/virtual-classrooms",
                        )
                      }
                    >
                      Virtual classrooms
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Government</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/document-management" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/document-management",
                        )
                      }
                    >
                      Document management
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/citizen-services" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/citizen-services",
                        )
                      }
                    >
                      Citizen services
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/public-safety-solutions" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/public-safety-solutions",
                        )
                      }
                    >
                      Public safety solutions
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Technology</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/cloud-solutions" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/cloud-solutions")
                      }
                    >
                      Cloud solutions
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/cybersecurity" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/cybersecurity")
                      }
                    >
                      Cybersecurity
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Energy</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/smart-grid-management" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/smart-grid-management",
                        )
                      }
                    >
                      Smart Grid Management
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/renewable-integration" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/renewable-integration",
                        )
                      }
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
                      render={<RouterLink to="/strategy" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/strategy")
                      }
                    >
                      Strategy
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/it" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/it")
                      }
                    >
                      IT
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/hr" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/hr")
                      }
                    >
                      HR
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/marketing" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/marketing")
                      }
                    >
                      Marketing
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/operations" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/operations")
                      }
                    >
                      Operations
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Implementation</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/onboarding" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/onboarding")
                      }
                    >
                      Onboarding
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/migration" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/migration")
                      }
                    >
                      Migration
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/customization" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/customization")
                      }
                    >
                      Customization
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/training" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/training")
                      }
                    >
                      Training
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/support" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/support")
                      }
                    >
                      Support
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/testing" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/testing")
                      }
                    >
                      Testing
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/rollout" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/rollout")
                      }
                    >
                      Rollout
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Training</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/online" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/online")
                      }
                    >
                      <DisplayIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/in-person" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/in-person")
                      }
                    >
                      In-person
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/workshops" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/workshops")
                      }
                    >
                      Workshops
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/certifications" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/certifications")
                      }
                    >
                      Certifications
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/tutorials" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/tutorials")
                      }
                    >
                      Tutorials
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/guides" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/guides")
                      }
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
                      render={<RouterLink to="/user-guides" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/user-guides")
                      }
                    >
                      User guides
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/api-reference" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/api-reference")
                      }
                    >
                      API reference
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/release-notes" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/release-notes")
                      }
                    >
                      Release notes
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/faqs" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/faqs")
                      }
                    >
                      FAQs
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Support &amp; help</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/contact-support" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/contact-support")
                      }
                    >
                      Contact support
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/community-forum" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/community-forum")
                      }
                    >
                      Community forum
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/troubleshooting" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/troubleshooting")
                      }
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
                      render={<RouterLink to="/digital-banking" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/digital-banking")
                      }
                    >
                      <DevicesIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      Digital banking
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/risk-management" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/risk-management")
                      }
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
                      render={<RouterLink to="/patient-management" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/patient-management",
                        )
                      }
                    >
                      <UserSearchIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      Patient management
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/telemedicine" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/telemedicine")
                      }
                    >
                      <CallIcon aria-hidden className="saltMegaMenuItem-icon" />
                      Telemedicine
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/compliance-solutions" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/compliance-solutions",
                        )
                      }
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
                      render={<RouterLink to="/e-commerce-platforms" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/e-commerce-platforms",
                        )
                      }
                    >
                      <CartIcon aria-hidden className="saltMegaMenuItem-icon" />
                      E-commerce platforms
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/supply-chain-optimization" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/supply-chain-optimization",
                        )
                      }
                    >
                      <LinkedIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      Supply chain optimization
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/quality-control" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/quality-control")
                      }
                    >
                      <SettingsIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      Quality control
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/production-planning" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/production-planning",
                        )
                      }
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
                      render={<RouterLink to="/learning-management-systems" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/learning-management-systems",
                        )
                      }
                    >
                      <GuideOpenIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      Learning management systems
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/virtual-classrooms" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/virtual-classrooms",
                        )
                      }
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
                      render={<RouterLink to="/document-management" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/document-management",
                        )
                      }
                    >
                      <DocumentIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      Document management
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/citizen-services" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/citizen-services",
                        )
                      }
                    >
                      <PinIcon aria-hidden className="saltMegaMenuItem-icon" />
                      Citizen services
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/public-safety-solutions" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/public-safety-solutions",
                        )
                      }
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
                      render={<RouterLink to="/cloud-solutions" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/cloud-solutions")
                      }
                    >
                      Cloud solutions
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/cybersecurity" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/cybersecurity")
                      }
                    >
                      Cybersecurity
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Energy</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/smart-grid-management" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/smart-grid-management",
                        )
                      }
                    >
                      Smart Grid Management
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/renewable-integration" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/renewable-integration",
                        )
                      }
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
                      render={<RouterLink to="/strategy" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/strategy")
                      }
                    >
                      Strategy
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/it" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/it")
                      }
                    >
                      IT
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/hr" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/hr")
                      }
                    >
                      HR
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/marketing" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/marketing")
                      }
                    >
                      Marketing
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/operations" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/operations")
                      }
                    >
                      Operations
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Implementation</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/onboarding" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/onboarding")
                      }
                    >
                      Onboarding
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/migration" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/migration")
                      }
                    >
                      Migration
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/customization" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/customization")
                      }
                    >
                      Customization
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/training" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/training")
                      }
                    >
                      Training
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/support" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/support")
                      }
                    >
                      Support
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/testing" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/testing")
                      }
                    >
                      Testing
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/rollout" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/rollout")
                      }
                    >
                      Rollout
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Training</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/online" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/online")
                      }
                    >
                      Online
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/in-person" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/in-person")
                      }
                    >
                      In-person
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/workshops" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/workshops")
                      }
                    >
                      Workshops
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/certifications" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/certifications")
                      }
                    >
                      Certifications
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/tutorials" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/tutorials")
                      }
                    >
                      Tutorials
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/guides" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/guides")
                      }
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
                      render={<RouterLink to="/user-guides" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/user-guides")
                      }
                    >
                      User guides
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/api-reference" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/api-reference")
                      }
                    >
                      API reference
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/release-notes" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/release-notes")
                      }
                    >
                      Release notes
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/faqs" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/faqs")
                      }
                    >
                      FAQs
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Support &amp; help</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/contact-support" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/contact-support")
                      }
                    >
                      Contact support
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/community-forum" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/community-forum")
                      }
                    >
                      Community forum
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/troubleshooting" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/troubleshooting")
                      }
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
                  render={<RouterLink to="/digital-banking" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/digital-banking")
                  }
                >
                  Digital banking
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/risk-management" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/risk-management")
                  }
                >
                  Risk management
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Healthcare</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/patient-management" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/patient-management")
                  }
                >
                  Patient management
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/telemedicine" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/telemedicine")
                  }
                >
                  Telemedicine
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/compliance-solutions" />}
                  onClick={() =>
                    console.log(
                      "MegaMenuItem clicked:",
                      "/compliance-solutions",
                    )
                  }
                >
                  Compliance solutions
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Retail</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/e-commerce-platforms" />}
                  onClick={() =>
                    console.log(
                      "MegaMenuItem clicked:",
                      "/e-commerce-platforms",
                    )
                  }
                >
                  E-commerce platforms
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/supply-chain-optimization" />}
                  onClick={() =>
                    console.log(
                      "MegaMenuItem clicked:",
                      "/supply-chain-optimization",
                    )
                  }
                >
                  Supply chain optimization
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/quality-control" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/quality-control")
                  }
                >
                  Quality control
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/production-planning" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/production-planning")
                  }
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
                  render={<RouterLink to="/digital-banking" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/digital-banking")
                  }
                >
                  Digital banking
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/risk-management" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/risk-management")
                  }
                >
                  Risk management
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Healthcare</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/patient-management" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/patient-management")
                  }
                >
                  Patient management
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/telemedicine" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/telemedicine")
                  }
                >
                  Telemedicine
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/compliance-solutions" />}
                  onClick={() =>
                    console.log(
                      "MegaMenuItem clicked:",
                      "/compliance-solutions",
                    )
                  }
                >
                  Compliance solutions
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Retail</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/e-commerce-platforms" />}
                  onClick={() =>
                    console.log(
                      "MegaMenuItem clicked:",
                      "/e-commerce-platforms",
                    )
                  }
                >
                  E-commerce platforms
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/supply-chain-optimization" />}
                  onClick={() =>
                    console.log(
                      "MegaMenuItem clicked:",
                      "/supply-chain-optimization",
                    )
                  }
                >
                  Supply chain optimization
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/quality-control" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/quality-control")
                  }
                >
                  Quality control
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/production-planning" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/production-planning")
                  }
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
                    render={<RouterLink to="/digital-banking" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/digital-banking")
                    }
                  >
                    Digital banking
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/risk-management" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/risk-management")
                    }
                  >
                    Risk management
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/patient-management" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/patient-management",
                      )
                    }
                  >
                    Patient management
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/telemedicine" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/telemedicine")
                    }
                  >
                    Telemedicine
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/compliance-solutions" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/compliance-solutions",
                      )
                    }
                  >
                    Compliance solutions
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/e-commerce-platforms" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/e-commerce-platforms",
                      )
                    }
                  >
                    E-commerce platforms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/supply-chain-optimization" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/supply-chain-optimization",
                      )
                    }
                  >
                    Supply chain optimization
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/quality-control" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/quality-control")
                    }
                  >
                    Quality control
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/production-planning" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/production-planning",
                      )
                    }
                  >
                    Production planning
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Education</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/learning-management-systems" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/learning-management-systems",
                      )
                    }
                  >
                    Learning management systems
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/virtual-classrooms" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/virtual-classrooms",
                      )
                    }
                  >
                    Virtual classrooms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Government</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/document-management" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/document-management",
                      )
                    }
                  >
                    Document management
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/citizen-services" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/citizen-services")
                    }
                  >
                    Citizen services
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/public-safety-solutions" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/public-safety-solutions",
                      )
                    }
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
                    render={<RouterLink to="/strategy" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/strategy")
                    }
                  >
                    Strategy
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/it" />}
                    onClick={() => console.log("MegaMenuItem clicked:", "/it")}
                  >
                    IT
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/hr" />}
                    onClick={() => console.log("MegaMenuItem clicked:", "/hr")}
                  >
                    HR
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/marketing" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/marketing")
                    }
                  >
                    Marketing
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/operations" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/operations")
                    }
                  >
                    Operations
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Implementation</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/onboarding" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/onboarding")
                    }
                  >
                    Onboarding
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/migration" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/migration")
                    }
                  >
                    Migration
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/customization" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/customization")
                    }
                  >
                    Customization
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/training" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/training")
                    }
                  >
                    Training
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/support" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/support")
                    }
                  >
                    Support
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/testing" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/testing")
                    }
                  >
                    Testing
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/rollout" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/rollout")
                    }
                  >
                    Rollout
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/online" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/online")
                    }
                  >
                    Online
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/in-person" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/in-person")
                    }
                  >
                    In-person
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/workshops" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/workshops")
                    }
                  >
                    Workshops
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/certifications" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/certifications")
                    }
                  >
                    Certifications
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/tutorials" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/tutorials")
                    }
                  >
                    Tutorials
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/guides" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/guides")
                    }
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
                    render={<RouterLink to="/user-guides" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/user-guides")
                    }
                  >
                    User guides
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/api-reference" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/api-reference")
                    }
                  >
                    API reference
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/release-notes" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/release-notes")
                    }
                  >
                    Release notes
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/faqs" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/faqs")
                    }
                  >
                    FAQs
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & help</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/contact-support" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/contact-support")
                    }
                  >
                    Contact support
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/community-forum" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/community-forum")
                    }
                  >
                    Community forum
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/troubleshooting" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/troubleshooting")
                    }
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
                      render={<RouterLink to="/digital-banking" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/digital-banking")
                      }
                    >
                      Digital banking
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/risk-management" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/risk-management")
                      }
                    >
                      Risk management
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Healthcare</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/patient-management" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/patient-management",
                        )
                      }
                    >
                      Patient management
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/telemedicine" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/telemedicine")
                      }
                    >
                      Telemedicine
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/compliance-solutions" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/compliance-solutions",
                        )
                      }
                    >
                      Compliance solutions
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Retail</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/e-commerce-platforms" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/e-commerce-platforms",
                        )
                      }
                    >
                      E-commerce platforms
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/supply-chain-optimization" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/supply-chain-optimization",
                        )
                      }
                    >
                      Supply chain optimization
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/quality-control" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/quality-control")
                      }
                    >
                      Quality control
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/production-planning" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/production-planning",
                        )
                      }
                    >
                      Production planning
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Education</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/learning-management-systems" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/learning-management-systems",
                        )
                      }
                    >
                      Learning management systems
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/virtual-classrooms" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/virtual-classrooms",
                        )
                      }
                    >
                      Virtual classrooms
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Government</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/document-management" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/document-management",
                        )
                      }
                    >
                      Document management
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/citizen-services" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/citizen-services",
                        )
                      }
                    >
                      Citizen services
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/public-safety-solutions" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuItem clicked:",
                          "/public-safety-solutions",
                        )
                      }
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
                      render={<RouterLink to="/strategy" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/strategy")
                      }
                    >
                      Strategy
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/it" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/it")
                      }
                    >
                      IT
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/hr" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/hr")
                      }
                    >
                      HR
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/marketing" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/marketing")
                      }
                    >
                      Marketing
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/operations" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/operations")
                      }
                    >
                      Operations
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Implementation</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/onboarding" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/onboarding")
                      }
                    >
                      Onboarding
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/migration" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/migration")
                      }
                    >
                      Migration
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/customization" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/customization")
                      }
                    >
                      Customization
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/training" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/training")
                      }
                    >
                      Training
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/support" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/support")
                      }
                    >
                      Support
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Training</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/online" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/online")
                      }
                    >
                      Online
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/in-person" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/in-person")
                      }
                    >
                      In-person
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/workshops" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/workshops")
                      }
                    >
                      Workshops
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/certifications" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/certifications")
                      }
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
                      render={<RouterLink to="/user-guides" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/user-guides")
                      }
                    >
                      User guides
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/api-reference" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/api-reference")
                      }
                    >
                      API reference
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/release-notes" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/release-notes")
                      }
                    >
                      Release notes
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/faqs" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/faqs")
                      }
                    >
                      FAQs
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Support</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/contact-support" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/contact-support")
                      }
                    >
                      Contact support
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/community-forum" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/community-forum")
                      }
                    >
                      Community forum
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/troubleshooting" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/troubleshooting")
                      }
                    >
                      Troubleshooting
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Learn</MegaMenuHeader>
                    <MegaMenuItem
                      render={<RouterLink to="/tutorials" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/tutorials")
                      }
                    >
                      Tutorials
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/guides" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/guides")
                      }
                    >
                      Guides
                    </MegaMenuItem>
                    <MegaMenuItem
                      render={<RouterLink to="/best-practices" />}
                      onClick={() =>
                        console.log("MegaMenuItem clicked:", "/best-practices")
                      }
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
                    render={<RouterLink to="/digital-banking" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/digital-banking")
                    }
                  >
                    Digital banking
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/risk-management" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/risk-management")
                    }
                  >
                    Risk management
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/patient-management" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/patient-management",
                      )
                    }
                  >
                    Patient management
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/telemedicine" />}
                    onClick={() =>
                      console.log("MegaMenuItem clicked:", "/telemedicine")
                    }
                  >
                    Telemedicine
                  </MegaMenuItem>
                  <MegaMenuItem
                    render={<RouterLink to="/compliance-solutions" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/compliance-solutions",
                      )
                    }
                  >
                    Compliance solutions
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem
                    render={<RouterLink to="/e-commerce-platforms" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuItem clicked:",
                        "/e-commerce-platforms",
                      )
                    }
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
                  render={<RouterLink to="/item-1" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/item-1")
                  }
                >
                  Item 1
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/item-2" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/item-2")
                  }
                >
                  Item 2
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/item-3" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/item-3")
                  }
                >
                  Item 3
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Group B</MegaMenuHeader>
                <MegaMenuItem
                  render={<RouterLink to="/item-4" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/item-4")
                  }
                >
                  Item 4
                </MegaMenuItem>
                <MegaMenuItem
                  render={<RouterLink to="/item-5" />}
                  onClick={() =>
                    console.log("MegaMenuItem clicked:", "/item-5")
                  }
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
