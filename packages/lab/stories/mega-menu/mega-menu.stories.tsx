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
  DatasetManagerIcon,
  DevicesIcon,
  DisplayIcon,
  DocumentEditIcon,
  DocumentIcon,
  GuideClosedIcon,
  GuideOpenIcon,
  HelpCircleIcon,
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
  MegaMenuBody,
  MegaMenuGroup,
  MegaMenuGroupHeading,
  MegaMenuGroups,
  MegaMenuList,
  MegaMenuListItem,
  MegaMenuPanel,
  MegaMenuSupportingActions,
  MegaMenuSupportingContent,
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
              <MegaMenuBody>
                <MegaMenuGroups>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>
                      Financial services
                    </MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/digital-banking" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/digital-banking",
                          )
                        }
                      >
                        <DevicesIcon aria-hidden />
                        Digital banking
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/risk-management" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/risk-management",
                          )
                        }
                      >
                        <DatasetManagerIcon aria-hidden />
                        Risk management
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/patient-management" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/patient-management",
                          )
                        }
                      >
                        <UserSearchIcon aria-hidden />
                        Patient management
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/telemedicine" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/telemedicine")
                        }
                      >
                        <CallIcon aria-hidden />
                        Telemedicine
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/compliance-solutions" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/compliance-solutions",
                          )
                        }
                      >
                        <PasteIcon aria-hidden />
                        Compliance solutions
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Retail</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/e-commerce-platforms" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/e-commerce-platforms",
                          )
                        }
                      >
                        <CartIcon aria-hidden />
                        E-commerce platforms
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Manufacturing</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/supply-chain-optimization" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/supply-chain-optimization",
                          )
                        }
                      >
                        <LinkedIcon aria-hidden />
                        Supply chain optimization
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/quality-control" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/quality-control",
                          )
                        }
                      >
                        <SettingsIcon aria-hidden />
                        Quality control
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/production-planning" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/production-planning",
                          )
                        }
                      >
                        <NotificationIcon aria-hidden />
                        Production planning
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Education</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={
                          <RouterLink to="/learning-management-systems" />
                        }
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/learning-management-systems",
                          )
                        }
                      >
                        <GuideOpenIcon aria-hidden />
                        Learning management systems
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/virtual-classrooms" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/virtual-classrooms",
                          )
                        }
                      >
                        <LaptopIcon aria-hidden />
                        Virtual classrooms
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Government</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/document-management" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/document-management",
                          )
                        }
                      >
                        <DocumentIcon aria-hidden />
                        Document management
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/citizen-services" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/citizen-services",
                          )
                        }
                      >
                        <PinIcon aria-hidden />
                        Citizen services
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/public-safety-solutions" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/public-safety-solutions",
                          )
                        }
                      >
                        <UserGroupIcon aria-hidden />
                        Public safety solutions
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                </MegaMenuGroups>
              </MegaMenuBody>
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
              <MegaMenuBody>
                <MegaMenuGroups>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Consulting</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/strategy" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/strategy")
                        }
                      >
                        <ChartBubbleIcon aria-hidden />
                        Strategy
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/it" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/it")
                        }
                      >
                        <LaptopIcon aria-hidden />
                        IT
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/hr" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/hr")
                        }
                      >
                        <UserGroupIcon aria-hidden />
                        HR
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/marketing" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/marketing")
                        }
                      >
                        <MarkerIcon aria-hidden />
                        Marketing
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/operations" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/operations")
                        }
                      >
                        <SettingsIcon aria-hidden />
                        Operations
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Implementation</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/onboarding" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/onboarding")
                        }
                      >
                        <PasteIcon aria-hidden />
                        Onboarding
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/migration" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/migration")
                        }
                      >
                        <SwapIcon aria-hidden />
                        Migration
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/customization" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/customization")
                        }
                      >
                        <PinIcon aria-hidden />
                        Customization
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/training" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/training")
                        }
                      >
                        <GuideClosedIcon aria-hidden />
                        Training
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/support" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/support")
                        }
                      >
                        <InfoIcon aria-hidden />
                        Support
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/testing" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/testing")
                        }
                      >
                        <MaintenanceIcon aria-hidden />
                        Testing
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/rollout" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/rollout")
                        }
                      >
                        <SaveIcon aria-hidden />
                        Rollout
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Training</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/online" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/online")
                        }
                      >
                        <DisplayIcon aria-hidden />
                        Online
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/in-person" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/in-person")
                        }
                      >
                        <UserIcon aria-hidden />
                        In-person
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/workshops" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/workshops")
                        }
                      >
                        <KeyIcon aria-hidden />
                        Workshops
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/certifications" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/certifications",
                          )
                        }
                      >
                        <DocumentIcon aria-hidden />
                        Certifications
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/tutorials" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/tutorials")
                        }
                      >
                        <DocumentEditIcon aria-hidden />
                        Tutorials
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/guides" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/guides")
                        }
                      >
                        <GuideOpenIcon aria-hidden />
                        Guides
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                </MegaMenuGroups>
              </MegaMenuBody>
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
              <MegaMenuBody>
                <MegaMenuGroups>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Documentation</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/user-guides" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/user-guides")
                        }
                      >
                        <GuideClosedIcon aria-hidden />
                        User guides
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/api-reference" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/api-reference")
                        }
                      >
                        <ApiIcon aria-hidden />
                        API reference
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/release-notes" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/release-notes")
                        }
                      >
                        <NotificationIcon aria-hidden />
                        Release notes
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/faqs" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/faqs")
                        }
                      >
                        <HelpCircleIcon aria-hidden />
                        FAQs
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Support & help</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/contact-support" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/contact-support",
                          )
                        }
                      >
                        <InfoIcon aria-hidden />
                        Contact support
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/community-forum" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/community-forum",
                          )
                        }
                      >
                        <ChatGroupIcon aria-hidden />
                        Community forum
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/troubleshooting" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/troubleshooting",
                          )
                        }
                      >
                        <AnnouncementIcon aria-hidden />
                        Troubleshooting
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                </MegaMenuGroups>
              </MegaMenuBody>
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
              <MegaMenuBody>
                <MegaMenuGroups>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>
                      Financial services
                    </MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/digital-banking" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/digital-banking",
                          )
                        }
                      >
                        Digital banking
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/risk-management" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/risk-management",
                          )
                        }
                      >
                        Risk management
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/patient-management" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/patient-management",
                          )
                        }
                      >
                        Patient management
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/telemedicine" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/telemedicine")
                        }
                      >
                        Telemedicine
                        <div className="menu-item-adornment">
                          <Tag category={1} variant="primary">
                            Premium
                          </Tag>
                        </div>
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/compliance-solutions" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/compliance-solutions",
                          )
                        }
                      >
                        Compliance solutions
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Retail</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/e-commerce-platforms" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/e-commerce-platforms",
                          )
                        }
                      >
                        E-commerce platforms
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Manufacturing</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/supply-chain-optimization" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/supply-chain-optimization",
                          )
                        }
                      >
                        Supply chain optimization
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/quality-control" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/quality-control",
                          )
                        }
                      >
                        Quality control
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/production-planning" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
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
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Education</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={
                          <RouterLink to="/learning-management-systems" />
                        }
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/learning-management-systems",
                          )
                        }
                      >
                        Learning management systems
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/virtual-classrooms" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/virtual-classrooms",
                          )
                        }
                      >
                        Virtual classrooms
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Government</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/document-management" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/document-management",
                          )
                        }
                      >
                        Document management
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/citizen-services" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/citizen-services",
                          )
                        }
                      >
                        Citizen services
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/public-safety-solutions" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/public-safety-solutions",
                          )
                        }
                      >
                        Public safety solutions
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                </MegaMenuGroups>
              </MegaMenuBody>
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
              <MegaMenuBody>
                <MegaMenuGroups>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Consulting</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/strategy" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/strategy")
                        }
                      >
                        Strategy
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/it" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/it")
                        }
                      >
                        IT
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/hr" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/hr")
                        }
                      >
                        HR
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/marketing" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/marketing")
                        }
                      >
                        Marketing
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/operations" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/operations")
                        }
                      >
                        Operations
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Implementation</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/onboarding" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/onboarding")
                        }
                      >
                        Onboarding
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/migration" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/migration")
                        }
                      >
                        Migration
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/customization" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/customization")
                        }
                      >
                        Customization
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/training" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/training")
                        }
                      >
                        Training
                        <div className="menu-item-adornment">
                          <Badge value="1" />
                        </div>
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/support" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/support")
                        }
                      >
                        Support
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/testing" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/testing")
                        }
                      >
                        Testing
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/rollout" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/rollout")
                        }
                      >
                        Rollout
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Training</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/online" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/online")
                        }
                      >
                        Online
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/in-person" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/in-person")
                        }
                      >
                        In-person
                        <div className="menu-item-adornment">
                          <Badge />
                        </div>
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/workshops" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/workshops")
                        }
                      >
                        Workshops
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/certifications" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/certifications",
                          )
                        }
                      >
                        Certifications
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/tutorials" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/tutorials")
                        }
                      >
                        Tutorials
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/guides" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/guides")
                        }
                      >
                        Guides
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                </MegaMenuGroups>
              </MegaMenuBody>
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
              <MegaMenuBody>
                <MegaMenuGroups>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Documentation</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/user-guides" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/user-guides")
                        }
                      >
                        User guides
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/api-reference" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/api-reference")
                        }
                      >
                        API reference
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/release-notes" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/release-notes")
                        }
                      >
                        Release notes
                        <div className="menu-item-adornment">
                          <Badge />
                        </div>
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/faqs" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/faqs")
                        }
                      >
                        FAQs
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Support & help</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/contact-support" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/contact-support",
                          )
                        }
                      >
                        Contact support
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/community-forum" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/community-forum",
                          )
                        }
                      >
                        Community forum
                        <div className="menu-item-adornment">
                          <Tag category={2} variant="primary">
                            New
                          </Tag>
                        </div>
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/troubleshooting" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/troubleshooting",
                          )
                        }
                      >
                        Troubleshooting
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                </MegaMenuGroups>
              </MegaMenuBody>
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
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Menu Header 1</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-1" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-1",
                        )
                      }
                    >
                      Mega menu item 1
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-2" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-2",
                        )
                      }
                    >
                      Mega menu item 2
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-3" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-3",
                        )
                      }
                    >
                      Mega menu item 3
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Menu Header 2</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-4" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-4",
                        )
                      }
                    >
                      Mega menu item 4
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-5" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-5",
                        )
                      }
                    >
                      Mega menu item 5
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-6" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-6",
                        )
                      }
                    >
                      Mega menu item 6
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Menu Header 3</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-7" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-7",
                        )
                      }
                    >
                      Mega menu item 7
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-8" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-8",
                        )
                      }
                    >
                      Mega menu item 8
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-9" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-9",
                        )
                      }
                    >
                      Mega menu item 9
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Menu Header 4</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-10" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-10",
                        )
                      }
                    >
                      Mega menu item 10
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-11" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-11",
                        )
                      }
                    >
                      Mega menu item 11
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-12" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-12",
                        )
                      }
                    >
                      Mega menu item 12
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuBody>
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
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Menu Header 1</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-1" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-1",
                        )
                      }
                    >
                      Mega menu item 1
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-2" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-2",
                        )
                      }
                    >
                      Mega menu item 2
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-3" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-3",
                        )
                      }
                    >
                      Mega menu item 3
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Menu Header 2</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-4" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-4",
                        )
                      }
                    >
                      Mega menu item 4
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-5" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-5",
                        )
                      }
                    >
                      Mega menu item 5
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-6" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-6",
                        )
                      }
                    >
                      Mega menu item 6
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Menu Header 3</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-7" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-7",
                        )
                      }
                    >
                      Mega menu item 7
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-8" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-8",
                        )
                      }
                    >
                      Mega menu item 8
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-9" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-9",
                        )
                      }
                    >
                      Mega menu item 9
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Menu Header 4</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-10" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-10",
                        )
                      }
                    >
                      Mega menu item 10
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-11" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-11",
                        )
                      }
                    >
                      Mega menu item 11
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-12" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-12",
                        )
                      }
                    >
                      Mega menu item 12
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuBody>
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
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Menu Header 1</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-1" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-1",
                        )
                      }
                    >
                      Mega menu item 1
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-2" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-2",
                        )
                      }
                    >
                      Mega menu item 2
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-3" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-3",
                        )
                      }
                    >
                      Mega menu item 3
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Menu Header 2</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-4" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-4",
                        )
                      }
                    >
                      Mega menu item 4
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-5" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-5",
                        )
                      }
                    >
                      Mega menu item 5
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-6" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-6",
                        )
                      }
                    >
                      Mega menu item 6
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Menu Header 3</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-7" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-7",
                        )
                      }
                    >
                      Mega menu item 7
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-8" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-8",
                        )
                      }
                    >
                      Mega menu item 8
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-9" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-9",
                        )
                      }
                    >
                      Mega menu item 9
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Menu Header 4</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-10" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-10",
                        )
                      }
                    >
                      Mega menu item 10
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-11" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-11",
                        )
                      }
                    >
                      Mega menu item 11
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-12" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-12",
                        )
                      }
                    >
                      Mega menu item 12
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuBody>
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
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Menu Header 1</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-1" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-1",
                        )
                      }
                    >
                      Mega menu item 1
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-2" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-2",
                        )
                      }
                    >
                      Mega menu item 2
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-3" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-3",
                        )
                      }
                    >
                      Mega menu item 3
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Menu Header 2</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-4" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-4",
                        )
                      }
                    >
                      Mega menu item 4
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-5" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-5",
                        )
                      }
                    >
                      Mega menu item 5
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-6" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-6",
                        )
                      }
                    >
                      Mega menu item 6
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Menu Header 3</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-7" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-7",
                        )
                      }
                    >
                      Mega menu item 7
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-8" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-8",
                        )
                      }
                    >
                      Mega menu item 8
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-9" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-9",
                        )
                      }
                    >
                      Mega menu item 9
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Menu Header 4</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-10" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-10",
                        )
                      }
                    >
                      Mega menu item 10
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-11" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-11",
                        )
                      }
                    >
                      Mega menu item 11
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/mega-menu-item-12" />}
                      onClick={() =>
                        console.log(
                          "MegaMenuListItem clicked:",
                          "/mega-menu-item-12",
                        )
                      }
                    >
                      Mega menu item 12
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuBody>
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
                <MegaMenuBody>
                  <MegaMenuGroups>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>
                        Financial services
                      </MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/digital-banking" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/digital-banking",
                            )
                          }
                        >
                          Digital banking
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/risk-management" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/risk-management",
                            )
                          }
                        >
                          Risk management
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/patient-management" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/patient-management",
                            )
                          }
                        >
                          Patient management
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/telemedicine" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/telemedicine",
                            )
                          }
                        >
                          Telemedicine
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/compliance-solutions" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/compliance-solutions",
                            )
                          }
                        >
                          Compliance solutions
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Retail</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/e-commerce-platforms" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/e-commerce-platforms",
                            )
                          }
                        >
                          E-commerce platforms
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Manufacturing</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={
                            <RouterLink to="/supply-chain-optimization" />
                          }
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/supply-chain-optimization",
                            )
                          }
                        >
                          Supply chain optimization
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/quality-control" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/quality-control",
                            )
                          }
                        >
                          Quality control
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/production-planning" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/production-planning",
                            )
                          }
                        >
                          Production planning
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Education</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={
                            <RouterLink to="/learning-management-systems" />
                          }
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/learning-management-systems",
                            )
                          }
                        >
                          Learning management systems
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/virtual-classrooms" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/virtual-classrooms",
                            )
                          }
                        >
                          Virtual classrooms
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Government</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/document-management" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/document-management",
                            )
                          }
                        >
                          Document management
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/citizen-services" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/citizen-services",
                            )
                          }
                        >
                          Citizen services
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/public-safety-solutions" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/public-safety-solutions",
                            )
                          }
                        >
                          Public safety solutions
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Technology</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/cloud-solutions" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/cloud-solutions",
                            )
                          }
                        >
                          Cloud solutions
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/cybersecurity" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/cybersecurity",
                            )
                          }
                        >
                          Cybersecurity
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Energy</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/smart-grid-management" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/smart-grid-management",
                            )
                          }
                        >
                          Smart Grid Management
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/renewable-integration" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/renewable-integration",
                            )
                          }
                        >
                          Renewable Integration
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                  </MegaMenuGroups>
                </MegaMenuBody>
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
                <MegaMenuBody>
                  <MegaMenuGroups>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Consulting</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/strategy" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/strategy")
                          }
                        >
                          Strategy
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/it" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/it")
                          }
                        >
                          IT
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/hr" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/hr")
                          }
                        >
                          HR
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/marketing" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/marketing")
                          }
                        >
                          Marketing
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/operations" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/operations")
                          }
                        >
                          Operations
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>
                        Implementation
                      </MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/onboarding" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/onboarding")
                          }
                        >
                          Onboarding
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/migration" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/migration")
                          }
                        >
                          Migration
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/customization" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/customization",
                            )
                          }
                        >
                          Customization
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/training" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/training")
                          }
                        >
                          Training
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/support" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/support")
                          }
                        >
                          Support
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/testing" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/testing")
                          }
                        >
                          Testing
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/rollout" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/rollout")
                          }
                        >
                          Rollout
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Training</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/online" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/online")
                          }
                        >
                          Online
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/in-person" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/in-person")
                          }
                        >
                          In-person
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/workshops" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/workshops")
                          }
                        >
                          Workshops
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/certifications" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/certifications",
                            )
                          }
                        >
                          Certifications
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/tutorials" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/tutorials")
                          }
                        >
                          Tutorials
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/guides" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/guides")
                          }
                        >
                          Guides
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                  </MegaMenuGroups>
                </MegaMenuBody>
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
                <MegaMenuBody>
                  <MegaMenuGroups>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Documentation</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/user-guides" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/user-guides")
                          }
                        >
                          User guides
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/api-reference" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/api-reference",
                            )
                          }
                        >
                          API reference
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/release-notes" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/release-notes",
                            )
                          }
                        >
                          Release notes
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/faqs" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/faqs")
                          }
                        >
                          FAQs
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>
                        Support &amp; help
                      </MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/contact-support" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/contact-support",
                            )
                          }
                        >
                          Contact support
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/community-forum" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/community-forum",
                            )
                          }
                        >
                          Community forum
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/troubleshooting" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/troubleshooting",
                            )
                          }
                        >
                          Troubleshooting
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                  </MegaMenuGroups>
                </MegaMenuBody>
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
                className="edge-to-edge-panel"
              >
                <MegaMenuBody>
                  <MegaMenuGroups>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>
                        Financial services
                      </MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/digital-banking" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/digital-banking",
                            )
                          }
                        >
                          Digital banking
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/risk-management" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/risk-management",
                            )
                          }
                        >
                          Risk management
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/patient-management" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/patient-management",
                            )
                          }
                        >
                          Patient management
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/telemedicine" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/telemedicine",
                            )
                          }
                        >
                          Telemedicine
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/compliance-solutions" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/compliance-solutions",
                            )
                          }
                        >
                          Compliance solutions
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Retail</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/e-commerce-platforms" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/e-commerce-platforms",
                            )
                          }
                        >
                          E-commerce platforms
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Manufacturing</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={
                            <RouterLink to="/supply-chain-optimization" />
                          }
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/supply-chain-optimization",
                            )
                          }
                        >
                          Supply chain optimization
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/quality-control" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/quality-control",
                            )
                          }
                        >
                          Quality control
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/production-planning" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/production-planning",
                            )
                          }
                        >
                          Production planning
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Education</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={
                            <RouterLink to="/learning-management-systems" />
                          }
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/learning-management-systems",
                            )
                          }
                        >
                          Learning management systems
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/virtual-classrooms" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/virtual-classrooms",
                            )
                          }
                        >
                          Virtual classrooms
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Government</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/document-management" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/document-management",
                            )
                          }
                        >
                          Document management
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/citizen-services" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/citizen-services",
                            )
                          }
                        >
                          Citizen services
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/public-safety-solutions" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/public-safety-solutions",
                            )
                          }
                        >
                          Public safety solutions
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Technology</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/cloud-solutions" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/cloud-solutions",
                            )
                          }
                        >
                          Cloud solutions
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/cybersecurity" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/cybersecurity",
                            )
                          }
                        >
                          Cybersecurity
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Energy</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/smart-grid-management" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/smart-grid-management",
                            )
                          }
                        >
                          Smart Grid Management
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/renewable-integration" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/renewable-integration",
                            )
                          }
                        >
                          Renewable Integration
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                  </MegaMenuGroups>
                </MegaMenuBody>
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
                className="edge-to-edge-panel"
              >
                <MegaMenuBody>
                  <MegaMenuGroups>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Consulting</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/strategy" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/strategy")
                          }
                        >
                          Strategy
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/it" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/it")
                          }
                        >
                          IT
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/hr" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/hr")
                          }
                        >
                          HR
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/marketing" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/marketing")
                          }
                        >
                          Marketing
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/operations" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/operations")
                          }
                        >
                          Operations
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>
                        Implementation
                      </MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/onboarding" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/onboarding")
                          }
                        >
                          Onboarding
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/migration" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/migration")
                          }
                        >
                          Migration
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/customization" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/customization",
                            )
                          }
                        >
                          Customization
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/training" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/training")
                          }
                        >
                          Training
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/support" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/support")
                          }
                        >
                          Support
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/testing" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/testing")
                          }
                        >
                          Testing
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/rollout" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/rollout")
                          }
                        >
                          Rollout
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Training</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/online" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/online")
                          }
                        >
                          Online
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/in-person" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/in-person")
                          }
                        >
                          In-person
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/workshops" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/workshops")
                          }
                        >
                          Workshops
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/certifications" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/certifications",
                            )
                          }
                        >
                          Certifications
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/tutorials" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/tutorials")
                          }
                        >
                          Tutorials
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/guides" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/guides")
                          }
                        >
                          Guides
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                  </MegaMenuGroups>
                </MegaMenuBody>
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
                className="edge-to-edge-panel"
              >
                <MegaMenuBody>
                  <MegaMenuGroups>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Documentation</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/user-guides" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/user-guides")
                          }
                        >
                          User guides
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/api-reference" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/api-reference",
                            )
                          }
                        >
                          API reference
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/release-notes" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/release-notes",
                            )
                          }
                        >
                          Release notes
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/faqs" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/faqs")
                          }
                        >
                          FAQs
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>
                        Support &amp; help
                      </MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/contact-support" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/contact-support",
                            )
                          }
                        >
                          Contact support
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/community-forum" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/community-forum",
                            )
                          }
                        >
                          Community forum
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/troubleshooting" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/troubleshooting",
                            )
                          }
                        >
                          Troubleshooting
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                  </MegaMenuGroups>
                </MegaMenuBody>
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
          <MegaMenuBody>
            <MegaMenuGroups className="custom-region-side-section">
              <MegaMenuGroup>
                <MegaMenuGroupHeading>Financial services</MegaMenuGroupHeading>
                <MegaMenuList>
                  <MegaMenuListItem
                    render={<RouterLink to="/digital-banking" />}
                    onClick={() =>
                      console.log("MegaMenuListItem clicked:", "/digital-banking")
                    }
                  >
                    Digital banking
                  </MegaMenuListItem>
                  <MegaMenuListItem
                    render={<RouterLink to="/risk-management" />}
                    onClick={() =>
                      console.log("MegaMenuListItem clicked:", "/risk-management")
                    }
                  >
                    Risk management
                  </MegaMenuListItem>
                </MegaMenuList>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
                <MegaMenuList>
                  <MegaMenuListItem
                    render={<RouterLink to="/patient-management" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuListItem clicked:",
                        "/patient-management",
                      )
                    }
                  >
                    Patient management
                  </MegaMenuListItem>
                  <MegaMenuListItem
                    render={<RouterLink to="/telemedicine" />}
                    onClick={() =>
                      console.log("MegaMenuListItem clicked:", "/telemedicine")
                    }
                  >
                    Telemedicine
                  </MegaMenuListItem>
                  <MegaMenuListItem
                    render={<RouterLink to="/compliance-solutions" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuListItem clicked:",
                        "/compliance-solutions",
                      )
                    }
                  >
                    Compliance solutions
                  </MegaMenuListItem>
                </MegaMenuList>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuGroupHeading>Retail</MegaMenuGroupHeading>
                <MegaMenuList>
                  <MegaMenuListItem
                    render={<RouterLink to="/e-commerce-platforms" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuListItem clicked:",
                        "/e-commerce-platforms",
                      )
                    }
                  >
                    E-commerce platforms
                  </MegaMenuListItem>
                </MegaMenuList>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuGroupHeading>Manufacturing</MegaMenuGroupHeading>
                <MegaMenuList>
                  <MegaMenuListItem
                    render={<RouterLink to="/supply-chain-optimization" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuListItem clicked:",
                        "/supply-chain-optimization",
                      )
                    }
                  >
                    Supply chain optimization
                  </MegaMenuListItem>
                  <MegaMenuListItem
                    render={<RouterLink to="/quality-control" />}
                    onClick={() =>
                      console.log("MegaMenuListItem clicked:", "/quality-control")
                    }
                  >
                    Quality control
                  </MegaMenuListItem>
                  <MegaMenuListItem
                    render={<RouterLink to="/production-planning" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuListItem clicked:",
                        "/production-planning",
                      )
                    }
                  >
                    Production planning
                  </MegaMenuListItem>
                </MegaMenuList>
              </MegaMenuGroup>
            </MegaMenuGroups>
            <MegaMenuSupportingActions>
              <FlexLayout gap={3}>
                <Link color="primary" underline="default" href="#link">
                  Book a demo
                </Link>
                <Link color="primary" underline="default" href="#link">
                  Support center
                </Link>
              </FlexLayout>
            </MegaMenuSupportingActions>
          </MegaMenuBody>
          <MegaMenuSupportingContent className="custom-region-side-content">
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
                  style={{ width: "fit-content" }}
                >
                  View guidelines
                </Link>
              </StackLayout>
            </FlexLayout>
          </MegaMenuSupportingContent>
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
          <MegaMenuSupportingContent className="custom-region-side-content">
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
                  style={{ width: "fit-content" }}
                >
                  View guidelines
                </Link>
              </StackLayout>
            </FlexLayout>
          </MegaMenuSupportingContent>
          <MegaMenuBody>
            <MegaMenuGroups className="custom-region-side-section">
              <MegaMenuGroup>
                <MegaMenuGroupHeading>Financial services</MegaMenuGroupHeading>
                <MegaMenuList>
                  <MegaMenuListItem
                    render={<RouterLink to="/digital-banking" />}
                    onClick={() =>
                      console.log("MegaMenuListItem clicked:", "/digital-banking")
                    }
                  >
                    Digital banking
                  </MegaMenuListItem>
                  <MegaMenuListItem
                    render={<RouterLink to="/risk-management" />}
                    onClick={() =>
                      console.log("MegaMenuListItem clicked:", "/risk-management")
                    }
                  >
                    Risk management
                  </MegaMenuListItem>
                </MegaMenuList>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
                <MegaMenuList>
                  <MegaMenuListItem
                    render={<RouterLink to="/patient-management" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuListItem clicked:",
                        "/patient-management",
                      )
                    }
                  >
                    Patient management
                  </MegaMenuListItem>
                  <MegaMenuListItem
                    render={<RouterLink to="/telemedicine" />}
                    onClick={() =>
                      console.log("MegaMenuListItem clicked:", "/telemedicine")
                    }
                  >
                    Telemedicine
                  </MegaMenuListItem>
                  <MegaMenuListItem
                    render={<RouterLink to="/compliance-solutions" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuListItem clicked:",
                        "/compliance-solutions",
                      )
                    }
                  >
                    Compliance solutions
                  </MegaMenuListItem>
                </MegaMenuList>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuGroupHeading>Retail</MegaMenuGroupHeading>
                <MegaMenuList>
                  <MegaMenuListItem
                    render={<RouterLink to="/e-commerce-platforms" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuListItem clicked:",
                        "/e-commerce-platforms",
                      )
                    }
                  >
                    E-commerce platforms
                  </MegaMenuListItem>
                </MegaMenuList>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuGroupHeading>Manufacturing</MegaMenuGroupHeading>
                <MegaMenuList>
                  <MegaMenuListItem
                    render={<RouterLink to="/supply-chain-optimization" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuListItem clicked:",
                        "/supply-chain-optimization",
                      )
                    }
                  >
                    Supply chain optimization
                  </MegaMenuListItem>
                  <MegaMenuListItem
                    render={<RouterLink to="/quality-control" />}
                    onClick={() =>
                      console.log("MegaMenuListItem clicked:", "/quality-control")
                    }
                  >
                    Quality control
                  </MegaMenuListItem>
                  <MegaMenuListItem
                    render={<RouterLink to="/production-planning" />}
                    onClick={() =>
                      console.log(
                        "MegaMenuListItem clicked:",
                        "/production-planning",
                      )
                    }
                  >
                    Production planning
                  </MegaMenuListItem>
                </MegaMenuList>
              </MegaMenuGroup>
            </MegaMenuGroups>
            <MegaMenuSupportingActions>
              <FlexLayout gap={3}>
                <Link color="primary" underline="default" href="#link">
                  Book a demo
                </Link>
                <Link color="primary" underline="default" href="#link">
                  Support center
                </Link>
              </FlexLayout>
            </MegaMenuSupportingActions>
          </MegaMenuBody>
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
              <MegaMenuBody>
                <MegaMenuGroups>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>
                      Financial services
                    </MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/digital-banking" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/digital-banking",
                          )
                        }
                      >
                        Digital banking
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/risk-management" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/risk-management",
                          )
                        }
                      >
                        Risk management
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/patient-management" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/patient-management",
                          )
                        }
                      >
                        Patient management
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/telemedicine" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/telemedicine")
                        }
                      >
                        Telemedicine
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/compliance-solutions" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/compliance-solutions",
                          )
                        }
                      >
                        Compliance solutions
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Retail</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/e-commerce-platforms" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/e-commerce-platforms",
                          )
                        }
                      >
                        E-commerce platforms
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Manufacturing</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/supply-chain-optimization" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/supply-chain-optimization",
                          )
                        }
                      >
                        Supply chain optimization
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/quality-control" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/quality-control",
                          )
                        }
                      >
                        Quality control
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/production-planning" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/production-planning",
                          )
                        }
                      >
                        Production planning
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Education</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={
                          <RouterLink to="/learning-management-systems" />
                        }
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/learning-management-systems",
                          )
                        }
                      >
                        Learning management systems
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/virtual-classrooms" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/virtual-classrooms",
                          )
                        }
                      >
                        Virtual classrooms
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Government</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/document-management" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/document-management",
                          )
                        }
                      >
                        Document management
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/citizen-services" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/citizen-services",
                          )
                        }
                      >
                        Citizen services
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/public-safety-solutions" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/public-safety-solutions",
                          )
                        }
                      >
                        Public safety solutions
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                </MegaMenuGroups>
                <MegaMenuSupportingActions>
                  <FlexLayout wrap gap={3}>
                    <Link color="primary" underline="default" href="#link">
                      Book a demo
                    </Link>
                    <Link color="primary" underline="default" href="#link">
                      Support center
                    </Link>
                  </FlexLayout>
                </MegaMenuSupportingActions>
              </MegaMenuBody>
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
              <MegaMenuBody>
                <MegaMenuGroups>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Consulting</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/strategy" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/strategy")
                        }
                      >
                        Strategy
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/it" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/it")
                        }
                      >
                        IT
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/hr" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/hr")
                        }
                      >
                        HR
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/marketing" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/marketing")
                        }
                      >
                        Marketing
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/operations" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/operations")
                        }
                      >
                        Operations
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Implementation</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/onboarding" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/onboarding")
                        }
                      >
                        Onboarding
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/migration" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/migration")
                        }
                      >
                        Migration
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/customization" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/customization")
                        }
                      >
                        Customization
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/training" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/training")
                        }
                      >
                        Training
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/support" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/support")
                        }
                      >
                        Support
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/testing" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/testing")
                        }
                      >
                        Testing
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/rollout" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/rollout")
                        }
                      >
                        Rollout
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Training</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/online" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/online")
                        }
                      >
                        Online
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/in-person" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/in-person")
                        }
                      >
                        In-person
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/workshops" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/workshops")
                        }
                      >
                        Workshops
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/certifications" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/certifications",
                          )
                        }
                      >
                        Certifications
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/tutorials" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/tutorials")
                        }
                      >
                        Tutorials
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/guides" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/guides")
                        }
                      >
                        Guides
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                </MegaMenuGroups>
                <MegaMenuSupportingActions>
                  <Link color="primary" underline="default" href="#link">
                    Service status
                  </Link>
                </MegaMenuSupportingActions>
              </MegaMenuBody>
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
              <MegaMenuBody>
                <MegaMenuGroups>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Documentation</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/user-guides" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/user-guides")
                        }
                      >
                        User guides
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/api-reference" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/api-reference")
                        }
                      >
                        API reference
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/release-notes" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/release-notes")
                        }
                      >
                        Release notes
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/faqs" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/faqs")
                        }
                      >
                        FAQs
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Support & help</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/contact-support" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/contact-support",
                          )
                        }
                      >
                        Contact support
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/community-forum" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/community-forum",
                          )
                        }
                      >
                        Community forum
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/troubleshooting" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/troubleshooting",
                          )
                        }
                      >
                        Troubleshooting
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                </MegaMenuGroups>
                <MegaMenuSupportingActions>
                  <Link color="primary" underline="default" href="#link">
                    Browse documentation
                  </Link>
                </MegaMenuSupportingActions>
              </MegaMenuBody>
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
                <MegaMenuBody>
                  <MegaMenuGroups>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>
                        Financial services
                      </MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/digital-banking" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/digital-banking",
                            )
                          }
                        >
                          Digital banking
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/risk-management" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/risk-management",
                            )
                          }
                        >
                          Risk management
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/patient-management" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/patient-management",
                            )
                          }
                        >
                          Patient management
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/telemedicine" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/telemedicine",
                            )
                          }
                        >
                          Telemedicine
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/compliance-solutions" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/compliance-solutions",
                            )
                          }
                        >
                          Compliance solutions
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Retail</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/e-commerce-platforms" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/e-commerce-platforms",
                            )
                          }
                        >
                          E-commerce platforms
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Manufacturing</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={
                            <RouterLink to="/supply-chain-optimization" />
                          }
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/supply-chain-optimization",
                            )
                          }
                        >
                          Supply chain optimization
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/quality-control" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/quality-control",
                            )
                          }
                        >
                          Quality control
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/production-planning" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/production-planning",
                            )
                          }
                        >
                          Production planning
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Education</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={
                            <RouterLink to="/learning-management-systems" />
                          }
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/learning-management-systems",
                            )
                          }
                        >
                          Learning management systems
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/virtual-classrooms" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/virtual-classrooms",
                            )
                          }
                        >
                          Virtual classrooms
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Government</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/document-management" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/document-management",
                            )
                          }
                        >
                          Document management
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/citizen-services" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/citizen-services",
                            )
                          }
                        >
                          Citizen services
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/public-safety-solutions" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/public-safety-solutions",
                            )
                          }
                        >
                          Public safety solutions
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                  </MegaMenuGroups>
                </MegaMenuBody>
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
                <MegaMenuBody>
                  <MegaMenuGroups>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Consulting</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/strategy" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/strategy")
                          }
                        >
                          Strategy
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/it" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/it")
                          }
                        >
                          IT
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/hr" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/hr")
                          }
                        >
                          HR
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/marketing" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/marketing")
                          }
                        >
                          Marketing
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/operations" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/operations")
                          }
                        >
                          Operations
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>
                        Implementation
                      </MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/onboarding" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/onboarding")
                          }
                        >
                          Onboarding
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/migration" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/migration")
                          }
                        >
                          Migration
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/customization" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/customization",
                            )
                          }
                        >
                          Customization
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/training" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/training")
                          }
                        >
                          Training
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/support" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/support")
                          }
                        >
                          Support
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Training</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/online" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/online")
                          }
                        >
                          Online
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/in-person" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/in-person")
                          }
                        >
                          In-person
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/workshops" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/workshops")
                          }
                        >
                          Workshops
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/certifications" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/certifications",
                            )
                          }
                        >
                          Certifications
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                  </MegaMenuGroups>
                </MegaMenuBody>
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
                <MegaMenuBody>
                  <MegaMenuGroups>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Documentation</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/user-guides" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/user-guides")
                          }
                        >
                          User guides
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/api-reference" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/api-reference",
                            )
                          }
                        >
                          API reference
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/release-notes" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/release-notes",
                            )
                          }
                        >
                          Release notes
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/faqs" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/faqs")
                          }
                        >
                          FAQs
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Support</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/contact-support" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/contact-support",
                            )
                          }
                        >
                          Contact support
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/community-forum" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/community-forum",
                            )
                          }
                        >
                          Community forum
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/troubleshooting" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/troubleshooting",
                            )
                          }
                        >
                          Troubleshooting
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Learn</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/tutorials" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/tutorials")
                          }
                        >
                          Tutorials
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/guides" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/guides")
                          }
                        >
                          Guides
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/best-practices" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/best-practices",
                            )
                          }
                        >
                          Best practices
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                  </MegaMenuGroups>
                </MegaMenuBody>
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
              <MegaMenuBody>
                <MegaMenuGroups>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>
                      Financial services
                    </MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/digital-banking" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/digital-banking",
                          )
                        }
                      >
                        Digital banking
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/risk-management" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/risk-management",
                          )
                        }
                      >
                        Risk management
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/patient-management" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/patient-management",
                          )
                        }
                      >
                        Patient management
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/telemedicine" />}
                        onClick={() =>
                          console.log("MegaMenuListItem clicked:", "/telemedicine")
                        }
                      >
                        Telemedicine
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        render={<RouterLink to="/compliance-solutions" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/compliance-solutions",
                          )
                        }
                      >
                        Compliance solutions
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Retail</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        render={<RouterLink to="/e-commerce-platforms" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuListItem clicked:",
                            "/e-commerce-platforms",
                          )
                        }
                      >
                        E-commerce platforms
                      </MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                </MegaMenuGroups>
              </MegaMenuBody>
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
            <MegaMenuBody>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Group A</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/item-1" />}
                      onClick={() =>
                        console.log("MegaMenuListItem clicked:", "/item-1")
                      }
                    >
                      Item 1
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/item-2" />}
                      onClick={() =>
                        console.log("MegaMenuListItem clicked:", "/item-2")
                      }
                    >
                      Item 2
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/item-3" />}
                      onClick={() =>
                        console.log("MegaMenuListItem clicked:", "/item-3")
                      }
                    >
                      Item 3
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Group B</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<RouterLink to="/item-4" />}
                      onClick={() =>
                        console.log("MegaMenuListItem clicked:", "/item-4")
                      }
                    >
                      Item 4
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      render={<RouterLink to="/item-5" />}
                      onClick={() =>
                        console.log("MegaMenuListItem clicked:", "/item-5")
                      }
                    >
                      Item 5
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuBody>
          </MegaMenuPanel>
        </MegaMenu>
      ))}
    </StackLayout>
  );
};
