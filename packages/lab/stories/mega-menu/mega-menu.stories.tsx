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
  MegaMenuFooter,
  MegaMenuSection,
  MegaMenuGroups,
  MegaMenuHeading,
  MegaMenuLink,
  MegaMenuPanel,
  MegaMenuAside,
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
              <MegaMenuGroups>
                <MegaMenuSection>
                  <MegaMenuHeading>Financial services</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/digital-banking" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/digital-banking")
                    }
                  >
                    <DevicesIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Digital banking
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/risk-management" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/risk-management")
                    }
                  >
                    <DatasetManagerIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Risk management
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Healthcare</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/patient-management" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/patient-management",
                      )
                    }
                  >
                    <UserSearchIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Patient management
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/telemedicine" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/telemedicine")
                    }
                  >
                    <CallIcon aria-hidden className="saltMegaMenuLink-icon" />
                    Telemedicine
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/compliance-solutions" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/compliance-solutions",
                      )
                    }
                  >
                    <PasteIcon aria-hidden className="saltMegaMenuLink-icon" />
                    Compliance solutions
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Retail</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/e-commerce-platforms" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/e-commerce-platforms",
                      )
                    }
                  >
                    <CartIcon aria-hidden className="saltMegaMenuLink-icon" />
                    E-commerce platforms
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Manufacturing</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/supply-chain-optimization" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/supply-chain-optimization",
                      )
                    }
                  >
                    <LinkedIcon aria-hidden className="saltMegaMenuLink-icon" />
                    Supply chain optimization
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/quality-control" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/quality-control")
                    }
                  >
                    <SettingsIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Quality control
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/production-planning" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/production-planning",
                      )
                    }
                  >
                    <NotificationIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Production planning
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Education</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/learning-management-systems" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/learning-management-systems",
                      )
                    }
                  >
                    <GuideOpenIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Learning management systems
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/virtual-classrooms" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/virtual-classrooms",
                      )
                    }
                  >
                    <LaptopIcon aria-hidden className="saltMegaMenuLink-icon" />
                    Virtual classrooms
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Government</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/document-management" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/document-management",
                      )
                    }
                  >
                    <DocumentIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Document management
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/citizen-services" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/citizen-services")
                    }
                  >
                    <PinIcon aria-hidden className="saltMegaMenuLink-icon" />
                    Citizen services
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/public-safety-solutions" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/public-safety-solutions",
                      )
                    }
                  >
                    <UserGroupIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Public safety solutions
                  </MegaMenuLink>
                </MegaMenuSection>
              </MegaMenuGroups>
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
              <MegaMenuGroups>
                <MegaMenuSection>
                  <MegaMenuHeading>Consulting</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/strategy" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/strategy")
                    }
                  >
                    <ChartBubbleIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Strategy
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/it" />}
                    onClick={() => console.log("MegaMenuLink clicked:", "/it")}
                  >
                    <LaptopIcon aria-hidden className="saltMegaMenuLink-icon" />
                    IT
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/hr" />}
                    onClick={() => console.log("MegaMenuLink clicked:", "/hr")}
                  >
                    <UserGroupIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    HR
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/marketing" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/marketing")
                    }
                  >
                    <MarkerIcon aria-hidden className="saltMegaMenuLink-icon" />
                    Marketing
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/operations" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/operations")
                    }
                  >
                    <SettingsIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Operations
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Implementation</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/onboarding" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/onboarding")
                    }
                  >
                    <PasteIcon aria-hidden className="saltMegaMenuLink-icon" />
                    Onboarding
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/migration" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/migration")
                    }
                  >
                    <SwapIcon aria-hidden className="saltMegaMenuLink-icon" />
                    Migration
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/customization" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/customization")
                    }
                  >
                    <PinIcon aria-hidden className="saltMegaMenuLink-icon" />
                    Customization
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/training" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/training")
                    }
                  >
                    <GuideClosedIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Training
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/support" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/support")
                    }
                  >
                    <InfoIcon aria-hidden className="saltMegaMenuLink-icon" />
                    Support
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/testing" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/testing")
                    }
                  >
                    <MaintenanceIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Testing
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/rollout" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/rollout")
                    }
                  >
                    <SaveIcon aria-hidden className="saltMegaMenuLink-icon" />
                    Rollout
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Training</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/online" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/online")
                    }
                  >
                    <DisplayIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Online
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/in-person" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/in-person")
                    }
                  >
                    <UserIcon aria-hidden className="saltMegaMenuLink-icon" />
                    In-person
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/workshops" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/workshops")
                    }
                  >
                    <KeyIcon aria-hidden className="saltMegaMenuLink-icon" />
                    Workshops
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/certifications" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/certifications")
                    }
                  >
                    <DocumentIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Certifications
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/tutorials" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/tutorials")
                    }
                  >
                    <DocumentEditIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Tutorials
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/guides" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/guides")
                    }
                  >
                    <GuideOpenIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Guides
                  </MegaMenuLink>
                </MegaMenuSection>
              </MegaMenuGroups>
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
              <MegaMenuGroups>
                <MegaMenuSection>
                  <MegaMenuHeading>Documentation</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/user-guides" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/user-guides")
                    }
                  >
                    <GuideClosedIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    User guides
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/api-reference" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/api-reference")
                    }
                  >
                    <ApiIcon aria-hidden className="saltMegaMenuLink-icon" />
                    API reference
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/release-notes" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/release-notes")
                    }
                  >
                    <NotificationIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Release notes
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/faqs" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/faqs")
                    }
                  >
                    <HelpIcon aria-hidden className="saltMegaMenuLink-icon" />
                    FAQs
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Support & help</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/contact-support" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/contact-support")
                    }
                  >
                    <InfoIcon aria-hidden className="saltMegaMenuLink-icon" />
                    Contact support
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/community-forum" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/community-forum")
                    }
                  >
                    <ChatGroupIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Community forum
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/troubleshooting" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/troubleshooting")
                    }
                  >
                    <AnnouncementIcon
                      aria-hidden
                      className="saltMegaMenuLink-icon"
                    />
                    Troubleshooting
                  </MegaMenuLink>
                </MegaMenuSection>
              </MegaMenuGroups>
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
              <MegaMenuGroups>
                <MegaMenuSection>
                  <MegaMenuHeading>Financial services</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/digital-banking" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/digital-banking")
                    }
                  >
                    Digital banking
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/risk-management" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/risk-management")
                    }
                  >
                    Risk management
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Healthcare</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/patient-management" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/patient-management",
                      )
                    }
                  >
                    Patient management
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/telemedicine" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/telemedicine")
                    }
                  >
                    Telemedicine
                    <div className="menu-item-adornment">
                      <Tag category={1} variant="primary">
                        Premium
                      </Tag>
                    </div>
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/compliance-solutions" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/compliance-solutions",
                      )
                    }
                  >
                    Compliance solutions
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Retail</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/e-commerce-platforms" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/e-commerce-platforms",
                      )
                    }
                  >
                    E-commerce platforms
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Manufacturing</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/supply-chain-optimization" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/supply-chain-optimization",
                      )
                    }
                  >
                    Supply chain optimization
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/quality-control" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/quality-control")
                    }
                  >
                    Quality control
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/production-planning" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
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
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Education</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/learning-management-systems" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/learning-management-systems",
                      )
                    }
                  >
                    Learning management systems
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/virtual-classrooms" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/virtual-classrooms",
                      )
                    }
                  >
                    Virtual classrooms
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Government</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/document-management" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/document-management",
                      )
                    }
                  >
                    Document management
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/citizen-services" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/citizen-services")
                    }
                  >
                    Citizen services
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/public-safety-solutions" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/public-safety-solutions",
                      )
                    }
                  >
                    Public safety solutions
                  </MegaMenuLink>
                </MegaMenuSection>
              </MegaMenuGroups>
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
              <MegaMenuGroups>
                <MegaMenuSection>
                  <MegaMenuHeading>Consulting</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/strategy" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/strategy")
                    }
                  >
                    Strategy
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/it" />}
                    onClick={() => console.log("MegaMenuLink clicked:", "/it")}
                  >
                    IT
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/hr" />}
                    onClick={() => console.log("MegaMenuLink clicked:", "/hr")}
                  >
                    HR
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/marketing" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/marketing")
                    }
                  >
                    Marketing
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/operations" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/operations")
                    }
                  >
                    Operations
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Implementation</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/onboarding" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/onboarding")
                    }
                  >
                    Onboarding
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/migration" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/migration")
                    }
                  >
                    Migration
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/customization" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/customization")
                    }
                  >
                    Customization
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/training" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/training")
                    }
                  >
                    Training
                    <div className="menu-item-adornment">
                      {" "}
                      <Badge value="1" />
                    </div>
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/support" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/support")
                    }
                  >
                    Support
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/testing" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/testing")
                    }
                  >
                    Testing
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/rollout" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/rollout")
                    }
                  >
                    Rollout
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Training</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/online" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/online")
                    }
                  >
                    Online
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/in-person" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/in-person")
                    }
                  >
                    In-person
                    <div className="menu-item-adornment">
                      {" "}
                      <Badge className="menu-item-adornment" />
                    </div>
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/workshops" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/workshops")
                    }
                  >
                    Workshops
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/certifications" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/certifications")
                    }
                  >
                    Certifications
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/tutorials" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/tutorials")
                    }
                  >
                    Tutorials
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/guides" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/guides")
                    }
                  >
                    Guides
                  </MegaMenuLink>
                </MegaMenuSection>
              </MegaMenuGroups>
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
              <MegaMenuGroups>
                <MegaMenuSection>
                  <MegaMenuHeading>Documentation</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/user-guides" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/user-guides")
                    }
                  >
                    User guides
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/api-reference" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/api-reference")
                    }
                  >
                    API reference
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/release-notes" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/release-notes")
                    }
                  >
                    Release notes
                    <div className="menu-item-adornment">
                      <Badge />
                    </div>
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/faqs" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/faqs")
                    }
                  >
                    FAQs
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Support & help</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/contact-support" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/contact-support")
                    }
                  >
                    Contact support
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/community-forum" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/community-forum")
                    }
                  >
                    Community forum
                    <div className="menu-item-adornment">
                      <Tag category={2} variant="primary">
                        New
                      </Tag>
                    </div>
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/troubleshooting" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/troubleshooting")
                    }
                  >
                    Troubleshooting
                  </MegaMenuLink>
                </MegaMenuSection>
              </MegaMenuGroups>
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
            <MegaMenuGroups>
              <MegaMenuSection>
                <MegaMenuHeading>Menu Header 1</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-1" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-1")
                  }
                >
                  Mega menu item 1
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-2" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-2")
                  }
                >
                  Mega menu item 2
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-3" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-3")
                  }
                >
                  Mega menu item 3
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Menu Header 2</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-4" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-4")
                  }
                >
                  Mega menu item 4
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-5" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-5")
                  }
                >
                  Mega menu item 5
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-6" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-6")
                  }
                >
                  Mega menu item 6
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Menu Header 3</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-7" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-7")
                  }
                >
                  Mega menu item 7
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-8" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-8")
                  }
                >
                  Mega menu item 8
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-9" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-9")
                  }
                >
                  Mega menu item 9
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Menu Header 4</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-10" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-10")
                  }
                >
                  Mega menu item 10
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-11" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-11")
                  }
                >
                  Mega menu item 11
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-12" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-12")
                  }
                >
                  Mega menu item 12
                </MegaMenuLink>
              </MegaMenuSection>
            </MegaMenuGroups>
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
            <MegaMenuGroups>
              <MegaMenuSection>
                <MegaMenuHeading>Menu Header 1</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-1" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-1")
                  }
                >
                  Mega menu item 1
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-2" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-2")
                  }
                >
                  Mega menu item 2
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-3" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-3")
                  }
                >
                  Mega menu item 3
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Menu Header 2</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-4" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-4")
                  }
                >
                  Mega menu item 4
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-5" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-5")
                  }
                >
                  Mega menu item 5
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-6" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-6")
                  }
                >
                  Mega menu item 6
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Menu Header 3</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-7" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-7")
                  }
                >
                  Mega menu item 7
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-8" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-8")
                  }
                >
                  Mega menu item 8
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-9" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-9")
                  }
                >
                  Mega menu item 9
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Menu Header 4</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-10" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-10")
                  }
                >
                  Mega menu item 10
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-11" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-11")
                  }
                >
                  Mega menu item 11
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-12" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-12")
                  }
                >
                  Mega menu item 12
                </MegaMenuLink>
              </MegaMenuSection>
            </MegaMenuGroups>
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
            <MegaMenuGroups>
              <MegaMenuSection>
                <MegaMenuHeading>Menu Header 1</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-1" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-1")
                  }
                >
                  Mega menu item 1
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-2" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-2")
                  }
                >
                  Mega menu item 2
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-3" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-3")
                  }
                >
                  Mega menu item 3
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Menu Header 2</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-4" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-4")
                  }
                >
                  Mega menu item 4
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-5" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-5")
                  }
                >
                  Mega menu item 5
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-6" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-6")
                  }
                >
                  Mega menu item 6
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Menu Header 3</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-7" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-7")
                  }
                >
                  Mega menu item 7
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-8" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-8")
                  }
                >
                  Mega menu item 8
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-9" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-9")
                  }
                >
                  Mega menu item 9
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Menu Header 4</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-10" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-10")
                  }
                >
                  Mega menu item 10
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-11" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-11")
                  }
                >
                  Mega menu item 11
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-12" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-12")
                  }
                >
                  Mega menu item 12
                </MegaMenuLink>
              </MegaMenuSection>
            </MegaMenuGroups>
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
            <MegaMenuGroups>
              <MegaMenuSection>
                <MegaMenuHeading>Menu Header 1</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-1" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-1")
                  }
                >
                  Mega menu item 1
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-2" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-2")
                  }
                >
                  Mega menu item 2
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-3" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-3")
                  }
                >
                  Mega menu item 3
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Menu Header 2</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-4" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-4")
                  }
                >
                  Mega menu item 4
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-5" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-5")
                  }
                >
                  Mega menu item 5
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-6" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-6")
                  }
                >
                  Mega menu item 6
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Menu Header 3</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-7" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-7")
                  }
                >
                  Mega menu item 7
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-8" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-8")
                  }
                >
                  Mega menu item 8
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-9" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-9")
                  }
                >
                  Mega menu item 9
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Menu Header 4</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-10" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-10")
                  }
                >
                  Mega menu item 10
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-11" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-11")
                  }
                >
                  Mega menu item 11
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/mega-menu-item-12" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/mega-menu-item-12")
                  }
                >
                  Mega menu item 12
                </MegaMenuLink>
              </MegaMenuSection>
            </MegaMenuGroups>
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
                <MegaMenuGroups>
                  <MegaMenuSection>
                    <MegaMenuHeading>Financial services</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/digital-banking" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/digital-banking")
                      }
                    >
                      Digital banking
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/risk-management" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/risk-management")
                      }
                    >
                      Risk management
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Healthcare</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/patient-management" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/patient-management",
                        )
                      }
                    >
                      Patient management
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/telemedicine" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/telemedicine")
                      }
                    >
                      Telemedicine
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/compliance-solutions" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/compliance-solutions",
                        )
                      }
                    >
                      Compliance solutions
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Retail</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/e-commerce-platforms" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/e-commerce-platforms",
                        )
                      }
                    >
                      E-commerce platforms
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Manufacturing</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/supply-chain-optimization" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/supply-chain-optimization",
                        )
                      }
                    >
                      Supply chain optimization
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/quality-control" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/quality-control")
                      }
                    >
                      Quality control
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/production-planning" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/production-planning",
                        )
                      }
                    >
                      Production planning
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Education</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/learning-management-systems" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/learning-management-systems",
                        )
                      }
                    >
                      Learning management systems
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/virtual-classrooms" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/virtual-classrooms",
                        )
                      }
                    >
                      Virtual classrooms
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Government</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/document-management" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/document-management",
                        )
                      }
                    >
                      Document management
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/citizen-services" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/citizen-services",
                        )
                      }
                    >
                      Citizen services
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/public-safety-solutions" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/public-safety-solutions",
                        )
                      }
                    >
                      Public safety solutions
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Technology</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/cloud-solutions" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/cloud-solutions")
                      }
                    >
                      Cloud solutions
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/cybersecurity" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/cybersecurity")
                      }
                    >
                      Cybersecurity
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Energy</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/smart-grid-management" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/smart-grid-management",
                        )
                      }
                    >
                      Smart Grid Management
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/renewable-integration" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/renewable-integration",
                        )
                      }
                    >
                      Renewable Integration
                    </MegaMenuLink>
                  </MegaMenuSection>
                </MegaMenuGroups>
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
                <MegaMenuGroups>
                  <MegaMenuSection>
                    <MegaMenuHeading>Consulting</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/strategy" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/strategy")
                      }
                    >
                      Strategy
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/it" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/it")
                      }
                    >
                      IT
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/hr" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/hr")
                      }
                    >
                      HR
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/marketing" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/marketing")
                      }
                    >
                      Marketing
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/operations" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/operations")
                      }
                    >
                      Operations
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Implementation</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/onboarding" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/onboarding")
                      }
                    >
                      Onboarding
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/migration" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/migration")
                      }
                    >
                      Migration
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/customization" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/customization")
                      }
                    >
                      Customization
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/training" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/training")
                      }
                    >
                      Training
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/support" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/support")
                      }
                    >
                      Support
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/testing" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/testing")
                      }
                    >
                      Testing
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/rollout" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/rollout")
                      }
                    >
                      Rollout
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Training</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/online" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/online")
                      }
                    >
                      <DisplayIcon
                        aria-hidden
                        className="saltMegaMenuLink-icon"
                      />
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/in-person" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/in-person")
                      }
                    >
                      In-person
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/workshops" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/workshops")
                      }
                    >
                      Workshops
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/certifications" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/certifications")
                      }
                    >
                      Certifications
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/tutorials" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/tutorials")
                      }
                    >
                      Tutorials
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/guides" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/guides")
                      }
                    >
                      Guides
                    </MegaMenuLink>
                  </MegaMenuSection>
                </MegaMenuGroups>
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
                <MegaMenuGroups>
                  <MegaMenuSection>
                    <MegaMenuHeading>Documentation</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/user-guides" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/user-guides")
                      }
                    >
                      User guides
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/api-reference" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/api-reference")
                      }
                    >
                      API reference
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/release-notes" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/release-notes")
                      }
                    >
                      Release notes
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/faqs" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/faqs")
                      }
                    >
                      FAQs
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Support &amp; help</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/contact-support" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/contact-support")
                      }
                    >
                      Contact support
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/community-forum" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/community-forum")
                      }
                    >
                      Community forum
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/troubleshooting" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/troubleshooting")
                      }
                    >
                      Troubleshooting
                    </MegaMenuLink>
                  </MegaMenuSection>
                </MegaMenuGroups>
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
                <MegaMenuGroups>
                  <MegaMenuSection>
                    <MegaMenuHeading>Financial services</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/digital-banking" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/digital-banking")
                      }
                    >
                      <DevicesIcon
                        aria-hidden
                        className="saltMegaMenuLink-icon"
                      />
                      Digital banking
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/risk-management" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/risk-management")
                      }
                    >
                      <DatasetManagerIcon
                        aria-hidden
                        className="saltMegaMenuLink-icon"
                      />
                      Risk management
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Healthcare</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/patient-management" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/patient-management",
                        )
                      }
                    >
                      <UserSearchIcon
                        aria-hidden
                        className="saltMegaMenuLink-icon"
                      />
                      Patient management
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/telemedicine" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/telemedicine")
                      }
                    >
                      <CallIcon aria-hidden className="saltMegaMenuLink-icon" />
                      Telemedicine
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/compliance-solutions" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/compliance-solutions",
                        )
                      }
                    >
                      <PasteIcon
                        aria-hidden
                        className="saltMegaMenuLink-icon"
                      />
                      Compliance solutions
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Retail</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/e-commerce-platforms" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/e-commerce-platforms",
                        )
                      }
                    >
                      <CartIcon aria-hidden className="saltMegaMenuLink-icon" />
                      E-commerce platforms
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Manufacturing</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/supply-chain-optimization" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/supply-chain-optimization",
                        )
                      }
                    >
                      <LinkedIcon
                        aria-hidden
                        className="saltMegaMenuLink-icon"
                      />
                      Supply chain optimization
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/quality-control" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/quality-control")
                      }
                    >
                      <SettingsIcon
                        aria-hidden
                        className="saltMegaMenuLink-icon"
                      />
                      Quality control
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/production-planning" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/production-planning",
                        )
                      }
                    >
                      <NotificationIcon
                        aria-hidden
                        className="saltMegaMenuLink-icon"
                      />
                      Production planning
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Education</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/learning-management-systems" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/learning-management-systems",
                        )
                      }
                    >
                      <GuideOpenIcon
                        aria-hidden
                        className="saltMegaMenuLink-icon"
                      />
                      Learning management systems
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/virtual-classrooms" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/virtual-classrooms",
                        )
                      }
                    >
                      <LaptopIcon
                        aria-hidden
                        className="saltMegaMenuLink-icon"
                      />
                      Virtual classrooms
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Government</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/document-management" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/document-management",
                        )
                      }
                    >
                      <DocumentIcon
                        aria-hidden
                        className="saltMegaMenuLink-icon"
                      />
                      Document management
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/citizen-services" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/citizen-services",
                        )
                      }
                    >
                      <PinIcon aria-hidden className="saltMegaMenuLink-icon" />
                      Citizen services
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/public-safety-solutions" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/public-safety-solutions",
                        )
                      }
                    >
                      <UserGroupIcon
                        aria-hidden
                        className="saltMegaMenuLink-icon"
                      />
                      Public safety solutions
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Technology</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/cloud-solutions" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/cloud-solutions")
                      }
                    >
                      Cloud solutions
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/cybersecurity" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/cybersecurity")
                      }
                    >
                      Cybersecurity
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Energy</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/smart-grid-management" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/smart-grid-management",
                        )
                      }
                    >
                      Smart Grid Management
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/renewable-integration" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/renewable-integration",
                        )
                      }
                    >
                      Renewable Integration
                    </MegaMenuLink>
                  </MegaMenuSection>
                </MegaMenuGroups>
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
                <MegaMenuGroups>
                  <MegaMenuSection>
                    <MegaMenuHeading>Consulting</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/strategy" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/strategy")
                      }
                    >
                      Strategy
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/it" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/it")
                      }
                    >
                      IT
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/hr" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/hr")
                      }
                    >
                      HR
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/marketing" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/marketing")
                      }
                    >
                      Marketing
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/operations" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/operations")
                      }
                    >
                      Operations
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Implementation</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/onboarding" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/onboarding")
                      }
                    >
                      Onboarding
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/migration" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/migration")
                      }
                    >
                      Migration
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/customization" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/customization")
                      }
                    >
                      Customization
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/training" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/training")
                      }
                    >
                      Training
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/support" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/support")
                      }
                    >
                      Support
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/testing" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/testing")
                      }
                    >
                      Testing
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/rollout" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/rollout")
                      }
                    >
                      Rollout
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Training</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/online" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/online")
                      }
                    >
                      Online
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/in-person" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/in-person")
                      }
                    >
                      In-person
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/workshops" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/workshops")
                      }
                    >
                      Workshops
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/certifications" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/certifications")
                      }
                    >
                      Certifications
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/tutorials" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/tutorials")
                      }
                    >
                      Tutorials
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/guides" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/guides")
                      }
                    >
                      Guides
                    </MegaMenuLink>
                  </MegaMenuSection>
                </MegaMenuGroups>
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
                <MegaMenuGroups>
                  <MegaMenuSection>
                    <MegaMenuHeading>Documentation</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/user-guides" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/user-guides")
                      }
                    >
                      User guides
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/api-reference" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/api-reference")
                      }
                    >
                      API reference
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/release-notes" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/release-notes")
                      }
                    >
                      Release notes
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/faqs" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/faqs")
                      }
                    >
                      FAQs
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Support &amp; help</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/contact-support" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/contact-support")
                      }
                    >
                      Contact support
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/community-forum" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/community-forum")
                      }
                    >
                      Community forum
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/troubleshooting" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/troubleshooting")
                      }
                    >
                      Troubleshooting
                    </MegaMenuLink>
                  </MegaMenuSection>
                </MegaMenuGroups>
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
        <MegaMenuPanel
          aria-label="Content on right menu"
          className="custom-region-no-container-padding custom-region-side"
        >
          <MegaMenuGroups>
              <MegaMenuSection>
                <MegaMenuHeading>Financial services</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/digital-banking" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/digital-banking")
                  }
                >
                  Digital banking
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/risk-management" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/risk-management")
                  }
                >
                  Risk management
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Healthcare</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/patient-management" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/patient-management")
                  }
                >
                  Patient management
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/telemedicine" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/telemedicine")
                  }
                >
                  Telemedicine
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/compliance-solutions" />}
                  onClick={() =>
                    console.log(
                      "MegaMenuLink clicked:",
                      "/compliance-solutions",
                    )
                  }
                >
                  Compliance solutions
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Retail</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/e-commerce-platforms" />}
                  onClick={() =>
                    console.log(
                      "MegaMenuLink clicked:",
                      "/e-commerce-platforms",
                    )
                  }
                >
                  E-commerce platforms
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Manufacturing</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/supply-chain-optimization" />}
                  onClick={() =>
                    console.log(
                      "MegaMenuLink clicked:",
                      "/supply-chain-optimization",
                    )
                  }
                >
                  Supply chain optimization
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/quality-control" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/quality-control")
                  }
                >
                  Quality control
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/production-planning" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/production-planning")
                  }
                >
                  Production planning
                </MegaMenuLink>
              </MegaMenuSection>
            </MegaMenuGroups>
          <MegaMenuFooter>
            <FlexLayout gap={3}>
              <Link
                color="primary"
                underline="default"
                href="#link"
                IconComponent={ChevronRightIcon}
              >
                Book a demo
              </Link>
              <Link
                color="primary"
                underline="default"
                href="#link"
                IconComponent={ChevronRightIcon}
              >
                Support center
              </Link>
            </FlexLayout>
          </MegaMenuFooter>
          <MegaMenuAside className="custom-region">
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
          </MegaMenuAside>
        </MegaMenuPanel>
      </MegaMenu>

      <MegaMenu
        open={openMenu === "left"}
        onOpenChange={(open) => setOpenMenu(open ? "left" : null)}
      >
        <MegaMenuTrigger>
          <Button>Content on left</Button>
        </MegaMenuTrigger>
        <MegaMenuPanel
          aria-label="Content on left menu"
          className="custom-region-no-container-padding custom-region-side"
        >
          <MegaMenuAside className="custom-region">
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
          </MegaMenuAside>
          <MegaMenuGroups>
              <MegaMenuSection>
                <MegaMenuHeading>Financial services</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/digital-banking" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/digital-banking")
                  }
                >
                  Digital banking
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/risk-management" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/risk-management")
                  }
                >
                  Risk management
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Healthcare</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/patient-management" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/patient-management")
                  }
                >
                  Patient management
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/telemedicine" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/telemedicine")
                  }
                >
                  Telemedicine
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/compliance-solutions" />}
                  onClick={() =>
                    console.log(
                      "MegaMenuLink clicked:",
                      "/compliance-solutions",
                    )
                  }
                >
                  Compliance solutions
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Retail</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/e-commerce-platforms" />}
                  onClick={() =>
                    console.log(
                      "MegaMenuLink clicked:",
                      "/e-commerce-platforms",
                    )
                  }
                >
                  E-commerce platforms
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Manufacturing</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/supply-chain-optimization" />}
                  onClick={() =>
                    console.log(
                      "MegaMenuLink clicked:",
                      "/supply-chain-optimization",
                    )
                  }
                >
                  Supply chain optimization
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/quality-control" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/quality-control")
                  }
                >
                  Quality control
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/production-planning" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/production-planning")
                  }
                >
                  Production planning
                </MegaMenuLink>
              </MegaMenuSection>
            </MegaMenuGroups>
          <MegaMenuFooter>
            <FlexLayout gap={3}>
              <Link
                color="primary"
                underline="default"
                href="#link"
                IconComponent={ChevronRightIcon}
              >
                Book a demo
              </Link>
              <Link
                color="primary"
                underline="default"
                href="#link"
                IconComponent={ChevronRightIcon}
              >
                Support center
              </Link>
            </FlexLayout>
          </MegaMenuFooter>
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

            <MegaMenuPanel>
              <MegaMenuGroups>
                <MegaMenuSection>
                  <MegaMenuHeading>Financial services</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/digital-banking" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/digital-banking")
                    }
                  >
                    Digital banking
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/risk-management" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/risk-management")
                    }
                  >
                    Risk management
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Healthcare</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/patient-management" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/patient-management",
                      )
                    }
                  >
                    Patient management
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/telemedicine" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/telemedicine")
                    }
                  >
                    Telemedicine
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/compliance-solutions" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/compliance-solutions",
                      )
                    }
                  >
                    Compliance solutions
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Retail</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/e-commerce-platforms" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/e-commerce-platforms",
                      )
                    }
                  >
                    E-commerce platforms
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Manufacturing</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/supply-chain-optimization" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/supply-chain-optimization",
                      )
                    }
                  >
                    Supply chain optimization
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/quality-control" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/quality-control")
                    }
                  >
                    Quality control
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/production-planning" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/production-planning",
                      )
                    }
                  >
                    Production planning
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Education</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/learning-management-systems" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/learning-management-systems",
                      )
                    }
                  >
                    Learning management systems
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/virtual-classrooms" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/virtual-classrooms",
                      )
                    }
                  >
                    Virtual classrooms
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Government</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/document-management" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/document-management",
                      )
                    }
                  >
                    Document management
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/citizen-services" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/citizen-services")
                    }
                  >
                    Citizen services
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/public-safety-solutions" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/public-safety-solutions",
                      )
                    }
                  >
                    Public safety solutions
                  </MegaMenuLink>
                </MegaMenuSection>
              </MegaMenuGroups>
              <MegaMenuFooter>
                <FlexLayout wrap gap={3}>
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    Book a demo
                  </Link>
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    Support center
                  </Link>
                </FlexLayout>
              </MegaMenuFooter>
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

            <MegaMenuPanel>
              <MegaMenuGroups>
                <MegaMenuSection>
                  <MegaMenuHeading>Consulting</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/strategy" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/strategy")
                    }
                  >
                    Strategy
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/it" />}
                    onClick={() => console.log("MegaMenuLink clicked:", "/it")}
                  >
                    IT
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/hr" />}
                    onClick={() => console.log("MegaMenuLink clicked:", "/hr")}
                  >
                    HR
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/marketing" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/marketing")
                    }
                  >
                    Marketing
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/operations" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/operations")
                    }
                  >
                    Operations
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Implementation</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/onboarding" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/onboarding")
                    }
                  >
                    Onboarding
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/migration" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/migration")
                    }
                  >
                    Migration
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/customization" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/customization")
                    }
                  >
                    Customization
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/training" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/training")
                    }
                  >
                    Training
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/support" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/support")
                    }
                  >
                    Support
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/testing" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/testing")
                    }
                  >
                    Testing
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/rollout" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/rollout")
                    }
                  >
                    Rollout
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Training</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/online" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/online")
                    }
                  >
                    Online
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/in-person" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/in-person")
                    }
                  >
                    In-person
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/workshops" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/workshops")
                    }
                  >
                    Workshops
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/certifications" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/certifications")
                    }
                  >
                    Certifications
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/tutorials" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/tutorials")
                    }
                  >
                    Tutorials
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/guides" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/guides")
                    }
                  >
                    Guides
                  </MegaMenuLink>
                </MegaMenuSection>
              </MegaMenuGroups>
              <MegaMenuFooter>
                <Link
                  color="primary"
                  underline="default"
                  href="#link"
                  IconComponent={ChevronRightIcon}
                >
                  Service status
                </Link>
              </MegaMenuFooter>
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
            <MegaMenuPanel>
              <MegaMenuGroups>
                <MegaMenuSection>
                  <MegaMenuHeading>Documentation</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/user-guides" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/user-guides")
                    }
                  >
                    User guides
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/api-reference" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/api-reference")
                    }
                  >
                    API reference
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/release-notes" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/release-notes")
                    }
                  >
                    Release notes
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/faqs" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/faqs")
                    }
                  >
                    FAQs
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Support & help</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/contact-support" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/contact-support")
                    }
                  >
                    Contact support
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/community-forum" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/community-forum")
                    }
                  >
                    Community forum
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/troubleshooting" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/troubleshooting")
                    }
                  >
                    Troubleshooting
                  </MegaMenuLink>
                </MegaMenuSection>
              </MegaMenuGroups>
              <MegaMenuFooter>
                <Link
                  color="primary"
                  underline="default"
                  href="#link"
                  IconComponent={ChevronRightIcon}
                >
                  Browse documentation
                </Link>
              </MegaMenuFooter>
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
                <MegaMenuGroups>
                  <MegaMenuSection>
                    <MegaMenuHeading>Financial services</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/digital-banking" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/digital-banking")
                      }
                    >
                      Digital banking
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/risk-management" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/risk-management")
                      }
                    >
                      Risk management
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Healthcare</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/patient-management" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/patient-management",
                        )
                      }
                    >
                      Patient management
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/telemedicine" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/telemedicine")
                      }
                    >
                      Telemedicine
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/compliance-solutions" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/compliance-solutions",
                        )
                      }
                    >
                      Compliance solutions
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Retail</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/e-commerce-platforms" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/e-commerce-platforms",
                        )
                      }
                    >
                      E-commerce platforms
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Manufacturing</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/supply-chain-optimization" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/supply-chain-optimization",
                        )
                      }
                    >
                      Supply chain optimization
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/quality-control" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/quality-control")
                      }
                    >
                      Quality control
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/production-planning" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/production-planning",
                        )
                      }
                    >
                      Production planning
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Education</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/learning-management-systems" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/learning-management-systems",
                        )
                      }
                    >
                      Learning management systems
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/virtual-classrooms" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/virtual-classrooms",
                        )
                      }
                    >
                      Virtual classrooms
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Government</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/document-management" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/document-management",
                        )
                      }
                    >
                      Document management
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/citizen-services" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/citizen-services",
                        )
                      }
                    >
                      Citizen services
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/public-safety-solutions" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuLink clicked:",
                          "/public-safety-solutions",
                        )
                      }
                    >
                      Public safety solutions
                    </MegaMenuLink>
                  </MegaMenuSection>
                </MegaMenuGroups>
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
                <MegaMenuGroups>
                  <MegaMenuSection>
                    <MegaMenuHeading>Consulting</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/strategy" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/strategy")
                      }
                    >
                      Strategy
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/it" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/it")
                      }
                    >
                      IT
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/hr" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/hr")
                      }
                    >
                      HR
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/marketing" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/marketing")
                      }
                    >
                      Marketing
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/operations" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/operations")
                      }
                    >
                      Operations
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Implementation</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/onboarding" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/onboarding")
                      }
                    >
                      Onboarding
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/migration" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/migration")
                      }
                    >
                      Migration
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/customization" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/customization")
                      }
                    >
                      Customization
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/training" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/training")
                      }
                    >
                      Training
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/support" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/support")
                      }
                    >
                      Support
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Training</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/online" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/online")
                      }
                    >
                      Online
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/in-person" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/in-person")
                      }
                    >
                      In-person
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/workshops" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/workshops")
                      }
                    >
                      Workshops
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/certifications" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/certifications")
                      }
                    >
                      Certifications
                    </MegaMenuLink>
                  </MegaMenuSection>
                </MegaMenuGroups>
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
                <MegaMenuGroups>
                  <MegaMenuSection>
                    <MegaMenuHeading>Documentation</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/user-guides" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/user-guides")
                      }
                    >
                      User guides
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/api-reference" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/api-reference")
                      }
                    >
                      API reference
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/release-notes" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/release-notes")
                      }
                    >
                      Release notes
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/faqs" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/faqs")
                      }
                    >
                      FAQs
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Support</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/contact-support" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/contact-support")
                      }
                    >
                      Contact support
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/community-forum" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/community-forum")
                      }
                    >
                      Community forum
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/troubleshooting" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/troubleshooting")
                      }
                    >
                      Troubleshooting
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Learn</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/tutorials" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/tutorials")
                      }
                    >
                      Tutorials
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/guides" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/guides")
                      }
                    >
                      Guides
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/best-practices" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/best-practices")
                      }
                    >
                      Best practices
                    </MegaMenuLink>
                  </MegaMenuSection>
                </MegaMenuGroups>
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
              <MegaMenuGroups>
                <MegaMenuSection>
                  <MegaMenuHeading>Financial services</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/digital-banking" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/digital-banking")
                    }
                  >
                    Digital banking
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/risk-management" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/risk-management")
                    }
                  >
                    Risk management
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Healthcare</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/patient-management" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/patient-management",
                      )
                    }
                  >
                    Patient management
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/telemedicine" />}
                    onClick={() =>
                      console.log("MegaMenuLink clicked:", "/telemedicine")
                    }
                  >
                    Telemedicine
                  </MegaMenuLink>
                  <MegaMenuLink
                    render={<RouterLink to="/compliance-solutions" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/compliance-solutions",
                      )
                    }
                  >
                    Compliance solutions
                  </MegaMenuLink>
                </MegaMenuSection>
                <MegaMenuSection>
                  <MegaMenuHeading>Retail</MegaMenuHeading>
                  <MegaMenuLink
                    render={<RouterLink to="/e-commerce-platforms" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuLink clicked:",
                        "/e-commerce-platforms",
                      )
                    }
                  >
                    E-commerce platforms
                  </MegaMenuLink>
                </MegaMenuSection>
              </MegaMenuGroups>
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
            <MegaMenuGroups>
              <MegaMenuSection>
                <MegaMenuHeading>Group A</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/item-1" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/item-1")
                  }
                >
                  Item 1
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/item-2" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/item-2")
                  }
                >
                  Item 2
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/item-3" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/item-3")
                  }
                >
                  Item 3
                </MegaMenuLink>
              </MegaMenuSection>
              <MegaMenuSection>
                <MegaMenuHeading>Group B</MegaMenuHeading>
                <MegaMenuLink
                  render={<RouterLink to="/item-4" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/item-4")
                  }
                >
                  Item 4
                </MegaMenuLink>
                <MegaMenuLink
                  render={<RouterLink to="/item-5" />}
                  onClick={() =>
                    console.log("MegaMenuLink clicked:", "/item-5")
                  }
                >
                  Item 5
                </MegaMenuLink>
              </MegaMenuSection>
            </MegaMenuGroups>
          </MegaMenuPanel>
        </MegaMenu>
      ))}
    </StackLayout>
  );
};
