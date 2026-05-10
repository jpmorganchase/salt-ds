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
  MegaMenuItemContent,
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
                    <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Risk management</MegaMenuItemContent>
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
                    <MegaMenuItemContent>
                      Patient management
                    </MegaMenuItemContent>
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
                    <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
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
                        "[WithIcons MegaMenu] selected value:",
                        "E-commerce platforms",
                      );
                    }}
                  >
                    <CartIcon aria-hidden />
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
                        "[WithIcons MegaMenu] selected value:",
                        "Supply chain optimization",
                      );
                    }}
                  >
                    <LinkedIcon aria-hidden />
                    <MegaMenuItemContent>
                      Supply chain optimization
                    </MegaMenuItemContent>
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
                    <MegaMenuItemContent>Quality control</MegaMenuItemContent>
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
                        "[WithIcons MegaMenu] selected value:",
                        "Learning management systems",
                      );
                    }}
                  >
                    <GuideOpenIcon aria-hidden />
                    <MegaMenuItemContent>
                      Learning management systems
                    </MegaMenuItemContent>
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
                        "[WithIcons MegaMenu] selected value:",
                        "Document management",
                      );
                    }}
                  >
                    <DocumentIcon aria-hidden />
                    <MegaMenuItemContent>
                      Document management
                    </MegaMenuItemContent>
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
                    <MegaMenuItemContent>Citizen services</MegaMenuItemContent>
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
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "Strategy",
                      );
                    }}
                  >
                    <ChartBubbleIcon aria-hidden />
                    <MegaMenuItemContent>Strategy</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[WithIcons MegaMenu] selected value:", "IT");
                    }}
                  >
                    <LaptopIcon aria-hidden />
                    <MegaMenuItemContent>IT</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[WithIcons MegaMenu] selected value:", "HR");
                    }}
                  >
                    <UserGroupIcon aria-hidden />
                    <MegaMenuItemContent>HR</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Marketing</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Operations</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Onboarding</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Migration</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Customization</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Training</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Support</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Testing</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Rollout</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Online</MegaMenuItemContent>
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
                    <MegaMenuItemContent>In-person</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Workshops</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Certifications</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Tutorials</MegaMenuItemContent>
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
                      console.log(
                        "[WithIcons MegaMenu] selected value:",
                        "User guides",
                      );
                    }}
                  >
                    <GuideClosedIcon aria-hidden />
                    <MegaMenuItemContent>User guides</MegaMenuItemContent>
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
                    <MegaMenuItemContent>API reference</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Release notes</MegaMenuItemContent>
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
                    <MegaMenuItemContent>FAQs</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Contact support</MegaMenuItemContent>
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
                    <MegaMenuItemContent>Community forum</MegaMenuItemContent>
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
