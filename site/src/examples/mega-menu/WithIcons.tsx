import { NavigationItem, StackLayout } from "@salt-ds/core";
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
  MegaMenuGroup,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuPanel,
  MegaMenuSection,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";
import styles from "./index.module.css";

export const WithIcons = (): ReactElement => {
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
      <StackLayout as="ol" direction="row" gap={1} className={styles.navList}>
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
                        "[WithIcons MegaMenu] selected value:",
                        "Digital banking",
                      );
                    }}
                  >
                    <DevicesIcon aria-hidden />
                    Digital banking
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Risk management",
                      );
                    }}
                  >
                    <DatasetManagerIcon aria-hidden />
                    Risk management
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Patient management",
                      );
                    }}
                  >
                    <UserSearchIcon aria-hidden />
                    Patient management
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Telemedicine",
                      );
                    }}
                  >
                    <CallIcon aria-hidden />
                    Telemedicine
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Compliance solutions",
                      );
                    }}
                  >
                    <PasteIcon aria-hidden />
                    Compliance solutions
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "E-commerce platforms",
                      );
                    }}
                  >
                    <CartIcon aria-hidden />
                    E-commerce platforms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Supply chain optimization",
                      );
                    }}
                  >
                    <LinkedIcon aria-hidden />
                    Supply chain optimization
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Quality control",
                      );
                    }}
                  >
                    <SettingsIcon aria-hidden />
                    Quality control
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Production planning",
                      );
                    }}
                  >
                    <NotificationIcon aria-hidden />
                    Production planning
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Education</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Learning management systems",
                      );
                    }}
                  >
                    <GuideOpenIcon aria-hidden />
                    Learning management systems
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Virtual classrooms",
                      );
                    }}
                  >
                    <LaptopIcon aria-hidden />
                    Virtual classrooms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Government</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Document management",
                      );
                    }}
                  >
                    <DocumentIcon aria-hidden />
                    Document management
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Citizen services",
                      );
                    }}
                  >
                    <PinIcon aria-hidden />
                    Citizen services
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Public safety solutions",
                      );
                    }}
                  >
                    <UserGroupIcon aria-hidden />
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
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Strategy",
                      );
                    }}
                  >
                    <ChartBubbleIcon aria-hidden />
                    Strategy
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[WithIcons MegaMenu] selected value:", "IT");
                    }}
                  >
                    <LaptopIcon aria-hidden />
                    IT
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[WithIcons MegaMenu] selected value:", "HR");
                    }}
                  >
                    <UserGroupIcon aria-hidden />
                    HR
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Marketing",
                      );
                    }}
                  >
                    <MarkerIcon aria-hidden />
                    Marketing
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Operations",
                      );
                    }}
                  >
                    <SettingsIcon aria-hidden />
                    Operations
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Implementation</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Onboarding",
                      );
                    }}
                  >
                    <PasteIcon aria-hidden />
                    Onboarding
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Migration",
                      );
                    }}
                  >
                    <SwapIcon aria-hidden />
                    Migration
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Customization",
                      );
                    }}
                  >
                    <PinIcon aria-hidden />
                    Customization
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Training",
                      );
                    }}
                  >
                    <GuideClosedIcon aria-hidden />
                    Training
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Support",
                      );
                    }}
                  >
                    <InfoIcon aria-hidden />
                    Support
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Testing",
                      );
                    }}
                  >
                    <MaintenanceIcon aria-hidden />
                    Testing
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Rollout",
                      );
                    }}
                  >
                    <SaveIcon aria-hidden />
                    Rollout
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Online",
                      );
                    }}
                  >
                    <DisplayIcon aria-hidden />
                    Online
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "In-person",
                      );
                    }}
                  >
                    <UserIcon aria-hidden />
                    In-person
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Workshops",
                      );
                    }}
                  >
                    <KeyIcon aria-hidden />
                    Workshops
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Certifications",
                      );
                    }}
                  >
                    <DocumentIcon aria-hidden />
                    Certifications
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Tutorials",
                      );
                    }}
                  >
                    <DocumentEditIcon aria-hidden />
                    Tutorials
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Guides",
                      );
                    }}
                  >
                    <GuideOpenIcon aria-hidden />
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
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "User guides",
                      );
                    }}
                  >
                    <GuideClosedIcon aria-hidden />
                    User guides
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "API reference",
                      );
                    }}
                  >
                    <ApiIcon aria-hidden />
                    API reference
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Release notes",
                      );
                    }}
                  >
                    <NotificationIcon aria-hidden />
                    Release notes
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "FAQs",
                      );
                    }}
                  >
                    <HelpIcon aria-hidden />
                    FAQs
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & help</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Contact support",
                      );
                    }}
                  >
                    <InfoIcon aria-hidden />
                    Contact support
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Community forum",
                      );
                    }}
                  >
                    <ChatGroupIcon aria-hidden />
                    Community forum
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Troubleshooting",
                      );
                    }}
                  >
                    <AnnouncementIcon aria-hidden />
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
