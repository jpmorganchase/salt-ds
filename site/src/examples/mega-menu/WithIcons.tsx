import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  ApiIcon,
  CallIcon,
  CartIcon,
  ChatGroupIcon,
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
} from "@salt-ds/icons";
import {
  MegaMenu,
  MegaMenuContainer,
  MegaMenuGroup,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuSection,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";
import styles from "./index.module.css";

export const WithIcons = (): ReactElement => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | undefined>();

  const handleOpenChange = (menu: string) => (open: boolean) => {
    setOpenMenu(open ? menu : null);
  };

  const handleSelectedItemChange = (
    menu: string,
    value: string | undefined,
  ) => {
    const nextValue = selectedItem === value ? undefined : value;
    setSelectedItem(nextValue);
    setActiveMenu(nextValue ? menu : null);
  };

  return (
    <nav>
      <StackLayout as="ol" direction="row" gap={1} className={styles.navList}>
        <li>
          <MegaMenu
            open={openMenu === "solutions"}
            onOpenChange={handleOpenChange("solutions")}
            selectedItem={selectedItem}
            onSelectedItemChange={(value) =>
              handleSelectedItemChange("solutions", value)
            }
          >
            <MegaMenuTrigger>
              <NavigationItem
                active={activeMenu === "solutions"}
                onClick={() => {
                  setOpenMenu((prev) =>
                    prev === "solutions" ? null : "solutions",
                  );
                }}
              >
                Solutions
              </NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuContainer>
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem value="Digital Banking">
                    <DevicesIcon aria-hidden />
                    Digital Banking
                  </MegaMenuItem>
                  <MegaMenuItem value="Risk Management">
                    Risk Management
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem value="Patient Management">
                    Patient Management
                  </MegaMenuItem>
                  <MegaMenuItem value="Telemedicine">
                    <CallIcon aria-hidden />
                    Telemedicine
                  </MegaMenuItem>
                  <MegaMenuItem value="Compliance Solutions">
                    <PasteIcon aria-hidden />
                    Compliance Solutions
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem value="E-Commerce Platforms">
                    <CartIcon aria-hidden />
                    E-Commerce Platforms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem value="Supply Chain Optimization">
                    <LinkedIcon aria-hidden />
                    Supply Chain Optimization
                  </MegaMenuItem>
                  <MegaMenuItem value="Quality Control">
                    <SettingsIcon aria-hidden />
                    Quality Control
                  </MegaMenuItem>
                  <MegaMenuItem value="Production Planning">
                    <NotificationIcon aria-hidden />
                    Production Planning
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Education</MegaMenuHeader>
                  <MegaMenuItem value="Learning Management Systems">
                    <GuideOpenIcon aria-hidden />
                    Learning Management Systems
                  </MegaMenuItem>
                  <MegaMenuItem value="Virtual Classrooms">
                    <LaptopIcon aria-hidden />
                    Virtual Classrooms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Government</MegaMenuHeader>
                  <MegaMenuItem value="Document Management">
                    <DocumentIcon aria-hidden />
                    Document Management
                  </MegaMenuItem>
                  <MegaMenuItem value="Citizen Services">
                    <PinIcon aria-hidden />
                    Citizen Services
                  </MegaMenuItem>
                  <MegaMenuItem value="Public Safety Solutions">
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
            selectedItem={selectedItem}
            onSelectedItemChange={(value) =>
              handleSelectedItemChange("services", value)
            }
          >
            <MegaMenuTrigger>
              <NavigationItem
                active={activeMenu === "services"}
                onClick={() => {
                  setOpenMenu((prev) =>
                    prev === "services" ? null : "services",
                  );
                }}
              >
                Services
              </NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuContainer>
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Consulting</MegaMenuHeader>
                  <MegaMenuItem value="Strategy">Strategy</MegaMenuItem>
                  <MegaMenuItem value="IT">
                    <LaptopIcon aria-hidden />
                    IT
                  </MegaMenuItem>
                  <MegaMenuItem value="HR">
                    <UserGroupIcon aria-hidden />
                    HR
                  </MegaMenuItem>
                  <MegaMenuItem value="Marketing">
                    <MarkerIcon aria-hidden />
                    Marketing
                  </MegaMenuItem>
                  <MegaMenuItem value="Operations">
                    <SettingsIcon aria-hidden />
                    Operations
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Implementation</MegaMenuHeader>
                  <MegaMenuItem value="Onboarding">
                    <PasteIcon aria-hidden />
                    Onboarding
                  </MegaMenuItem>
                  <MegaMenuItem value="Migration">
                    <SwapIcon aria-hidden />
                    Migration
                  </MegaMenuItem>
                  <MegaMenuItem value="Customization">
                    <PinIcon aria-hidden />
                    Customization
                  </MegaMenuItem>
                  <MegaMenuItem value="Training">
                    <GuideClosedIcon aria-hidden />
                    Training
                  </MegaMenuItem>
                  <MegaMenuItem value="Support">
                    <InfoIcon aria-hidden />
                    Support
                  </MegaMenuItem>
                  <MegaMenuItem value="Testing">Testing</MegaMenuItem>
                  <MegaMenuItem value="Rollout">
                    <SaveIcon aria-hidden />
                    Rollout
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem value="Online">
                    <DisplayIcon aria-hidden />
                    Online
                  </MegaMenuItem>
                  <MegaMenuItem value="In-Person">In-Person</MegaMenuItem>
                  <MegaMenuItem value="Workshops">
                    <KeyIcon aria-hidden />
                    Workshops
                  </MegaMenuItem>
                  <MegaMenuItem value="Certifications">
                    <DocumentIcon aria-hidden />
                    Certifications
                  </MegaMenuItem>
                  <MegaMenuItem value="Tutorials">Tutorials</MegaMenuItem>
                  <MegaMenuItem value="Guides">
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
            selectedItem={selectedItem}
            onSelectedItemChange={(value) =>
              handleSelectedItemChange("resources", value)
            }
          >
            <MegaMenuTrigger>
              <NavigationItem
                active={activeMenu === "resources"}
                onClick={() => {
                  setOpenMenu((prev) =>
                    prev === "resources" ? null : "resources",
                  );
                }}
              >
                Resources
              </NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuContainer>
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Documentation</MegaMenuHeader>
                  <MegaMenuItem value="User Guides">User Guides</MegaMenuItem>
                  <MegaMenuItem value="API Reference">
                    <ApiIcon aria-hidden />
                    API Reference
                  </MegaMenuItem>
                  <MegaMenuItem value="Release Notes">
                    <NotificationIcon aria-hidden />
                    Release Notes
                  </MegaMenuItem>
                  <MegaMenuItem value="FAQs">
                    <HelpIcon aria-hidden />
                    FAQs
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & Help</MegaMenuHeader>
                  <MegaMenuItem value="Contact Support">
                    <InfoIcon aria-hidden />
                    Contact Support
                  </MegaMenuItem>
                  <MegaMenuItem value="Community Forum">
                    <ChatGroupIcon aria-hidden />
                    Community Forum
                  </MegaMenuItem>
                  <MegaMenuItem value="Troubleshooting">
                    Troubleshooting
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuContainer>
          </MegaMenu>
        </li>
      </StackLayout>
    </nav>
  );
};
