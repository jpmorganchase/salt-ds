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
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    undefined,
  );

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
      <StackLayout as="ol" direction="row" gap={1}>
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
              <NavigationItem active={activeMenu === "solutions"}>
                Solutions
              </NavigationItem>
            </MegaMenuTrigger>

            <MegaMenuPanel aria-label="Solutions menu">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem value="Digital banking">
                    <DevicesIcon aria-hidden />
                    Digital banking
                  </MegaMenuItem>
                  <MegaMenuItem value="Risk management">
                    <DatasetManagerIcon aria-hidden />
                    Risk management
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem value="Patient management">
                    <UserSearchIcon aria-hidden />
                    Patient management
                  </MegaMenuItem>
                  <MegaMenuItem value="Telemedicine">
                    <CallIcon aria-hidden />
                    Telemedicine
                  </MegaMenuItem>
                  <MegaMenuItem value="Compliance solutions">
                    <PasteIcon aria-hidden />
                    Compliance solutions
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem value="E-commerce platforms">
                    <CartIcon aria-hidden />
                    E-commerce platforms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem value="Supply chain optimization">
                    <LinkedIcon aria-hidden />
                    Supply chain optimization
                  </MegaMenuItem>
                  <MegaMenuItem value="Quality control">
                    <SettingsIcon aria-hidden />
                    Quality control
                  </MegaMenuItem>
                  <MegaMenuItem value="Production planning">
                    <NotificationIcon aria-hidden />
                    Production planning
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Education</MegaMenuHeader>
                  <MegaMenuItem value="Learning management systems">
                    <GuideOpenIcon aria-hidden />
                    Learning management systems
                  </MegaMenuItem>
                  <MegaMenuItem value="Virtual classrooms">
                    <LaptopIcon aria-hidden />
                    Virtual classrooms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Government</MegaMenuHeader>
                  <MegaMenuItem value="Document management">
                    <DocumentIcon aria-hidden />
                    Document management
                  </MegaMenuItem>
                  <MegaMenuItem value="Citizen services">
                    <PinIcon aria-hidden />
                    Citizen services
                  </MegaMenuItem>
                  <MegaMenuItem value="Public safety solutions">
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
            selectedItem={selectedItem}
            onSelectedItemChange={(value) =>
              handleSelectedItemChange("services", value)
            }
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
                  <MegaMenuItem value="Strategy">
                    <ChartBubbleIcon aria-hidden />
                    Strategy
                  </MegaMenuItem>
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
                  <MegaMenuItem value="Testing">
                    {" "}
                    <MaintenanceIcon aria-hidden />
                    Testing
                  </MegaMenuItem>
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
                  <MegaMenuItem value="In-person">
                    <UserIcon aria-hidden />
                    In-person
                  </MegaMenuItem>
                  <MegaMenuItem value="Workshops">
                    <KeyIcon aria-hidden />
                    Workshops
                  </MegaMenuItem>
                  <MegaMenuItem value="Certifications">
                    <DocumentIcon aria-hidden />
                    Certifications
                  </MegaMenuItem>
                  <MegaMenuItem value="Tutorials">
                    {" "}
                    <DocumentEditIcon aria-hidden />
                    Tutorials
                  </MegaMenuItem>
                  <MegaMenuItem value="Guides">
                    <GuideOpenIcon aria-hidden /> Guides
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
            selectedItem={selectedItem}
            onSelectedItemChange={(value) =>
              handleSelectedItemChange("resources", value)
            }
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
                  <MegaMenuItem value="User guides">
                    {" "}
                    <GuideClosedIcon aria-hidden />
                    User guides
                  </MegaMenuItem>
                  <MegaMenuItem value="API reference">
                    <ApiIcon aria-hidden />
                    API reference
                  </MegaMenuItem>
                  <MegaMenuItem value="Release notes">
                    <NotificationIcon aria-hidden />
                    Release notes
                  </MegaMenuItem>
                  <MegaMenuItem value="FAQs">
                    <HelpIcon aria-hidden />
                    FAQs
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & Help</MegaMenuHeader>
                  <MegaMenuItem value="Contact support">
                    <InfoIcon aria-hidden />
                    Contact support
                  </MegaMenuItem>
                  <MegaMenuItem value="Community forum">
                    <ChatGroupIcon aria-hidden />
                    Community forum
                  </MegaMenuItem>
                  <MegaMenuItem value="Troubleshooting">
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

export const WithAdornment: StoryFn = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    undefined,
  );

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
      <StackLayout as="ol" direction="row" gap={1}>
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
              <NavigationItem active={activeMenu === "solutions"}>
                Solutions
              </NavigationItem>
            </MegaMenuTrigger>

            <MegaMenuPanel aria-label="Solutions menu">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem value="Digital banking">
                    Digital banking
                  </MegaMenuItem>
                  <MegaMenuItem value="Risk management">
                    Risk management
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem value="Patient management">
                    Patient management
                  </MegaMenuItem>
                  <MegaMenuItem value="Telemedicine">
                    Telemedicine
                    <Tag
                      category={1}
                      variant="primary"
                      className="menu-item-adornment"
                    >
                      Premium
                    </Tag>
                  </MegaMenuItem>
                  <MegaMenuItem value="Compliance solutions">
                    Compliance solutions
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem value="E-commerce platforms">
                    E-commerce platforms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem value="Supply chain optimization">
                    Supply chain optimization
                  </MegaMenuItem>
                  <MegaMenuItem value="Quality control">
                    Quality control
                  </MegaMenuItem>
                  <MegaMenuItem value="Production planning">
                    Production planning
                    <Tag
                      category={2}
                      variant="primary"
                      className="menu-item-adornment"
                    >
                      New
                    </Tag>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Education</MegaMenuHeader>
                  <MegaMenuItem value="Learning management systems">
                    Learning management systems
                  </MegaMenuItem>
                  <MegaMenuItem value="Virtual classrooms">
                    Virtual classrooms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Government</MegaMenuHeader>
                  <MegaMenuItem value="Document management">
                    Document management
                  </MegaMenuItem>
                  <MegaMenuItem value="Citizen services">
                    Citizen services
                  </MegaMenuItem>
                  <MegaMenuItem value="Public safety solutions">
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
            selectedItem={selectedItem}
            onSelectedItemChange={(value) =>
              handleSelectedItemChange("services", value)
            }
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
                  <MegaMenuItem value="Strategy">Strategy</MegaMenuItem>
                  <MegaMenuItem value="IT">IT</MegaMenuItem>
                  <MegaMenuItem value="HR">HR</MegaMenuItem>
                  <MegaMenuItem value="Marketing">Marketing</MegaMenuItem>
                  <MegaMenuItem value="Operations">Operations</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Implementation</MegaMenuHeader>
                  <MegaMenuItem value="Onboarding">Onboarding</MegaMenuItem>
                  <MegaMenuItem value="Migration">Migration</MegaMenuItem>
                  <MegaMenuItem value="Customization">
                    Customization
                  </MegaMenuItem>
                  <MegaMenuItem value="Training">
                    {" "}
                    Training
                    <Badge value="1" className="menu-item-adornment" />
                  </MegaMenuItem>
                  <MegaMenuItem value="Support">Support</MegaMenuItem>
                  <MegaMenuItem value="Testing">Testing</MegaMenuItem>
                  <MegaMenuItem value="Rollout">Rollout</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem value="Online">Online</MegaMenuItem>
                  <MegaMenuItem value="In-person">
                    {" "}
                    In-person
                    <Badge value="3" className="menu-item-adornment" />
                  </MegaMenuItem>
                  <MegaMenuItem value="Workshops">Workshops</MegaMenuItem>
                  <MegaMenuItem value="Certifications">
                    Certifications
                  </MegaMenuItem>
                  <MegaMenuItem value="Tutorials">Tutorials</MegaMenuItem>
                  <MegaMenuItem value="Guides">Guides</MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuPanel>
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
              <NavigationItem active={activeMenu === "resources"}>
                Resources
              </NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuPanel aria-label="Resources menu">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Documentation</MegaMenuHeader>
                  <MegaMenuItem value="User guides">User guides</MegaMenuItem>
                  <MegaMenuItem value="API reference">
                    API reference
                  </MegaMenuItem>
                  <MegaMenuItem value="Release notes">
                    Release notes <Badge className="menu-item-adornment" />
                  </MegaMenuItem>
                  <MegaMenuItem value="FAQs">FAQs</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & Help</MegaMenuHeader>
                  <MegaMenuItem value="Contact support">
                    Contact support
                  </MegaMenuItem>
                  <MegaMenuItem value="Community forum">
                    Community forum
                    <Tag
                      category={2}
                      variant="primary"
                      className="menu-item-adornment"
                    >
                      New
                    </Tag>
                  </MegaMenuItem>
                  <MegaMenuItem value="Troubleshooting">
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
                <MegaMenuItem value="Mega menu item 1">
                  Mega menu item 1
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 2">
                  Mega menu item 2
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 3">
                  Mega menu item 3
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
                <MegaMenuItem value="Mega menu item 4">
                  Mega menu item 4
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 5">
                  Mega menu item 5
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 6">
                  Mega menu item 6
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
                <MegaMenuItem value="Mega menu item 7">
                  Mega menu item 7
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 8">
                  Mega menu item 8
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 9">
                  Mega menu item 9
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
                <MegaMenuItem value="Mega menu item 10">
                  Mega menu item 10
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 11">
                  Mega menu item 11
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 12">
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
                <MegaMenuItem value="Mega menu item 1">
                  Mega menu item 1
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 2">
                  Mega menu item 2
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 3">
                  Mega menu item 3
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
                <MegaMenuItem value="Mega menu item 4">
                  Mega menu item 4
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 5">
                  Mega menu item 5
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 6">
                  Mega menu item 6
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
                <MegaMenuItem value="Mega menu item 7">
                  Mega menu item 7
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 8">
                  Mega menu item 8
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 9">
                  Mega menu item 9
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
                <MegaMenuItem value="Mega menu item 10">
                  Mega menu item 10
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 11">
                  Mega menu item 11
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 12">
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
                <MegaMenuItem value="Mega menu item 1">
                  Mega menu item 1
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 2">
                  Mega menu item 2
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 3">
                  Mega menu item 3
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
                <MegaMenuItem value="Mega menu item 4">
                  Mega menu item 4
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 5">
                  Mega menu item 5
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 6">
                  Mega menu item 6
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
                <MegaMenuItem value="Mega menu item 7">
                  Mega menu item 7
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 8">
                  Mega menu item 8
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 9">
                  Mega menu item 9
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
                <MegaMenuItem value="Mega menu item 10">
                  Mega menu item 10
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 11">
                  Mega menu item 11
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 12">
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
                <MegaMenuItem value="Mega menu item 1">
                  Mega menu item 1
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 2">
                  Mega menu item 2
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 3">
                  Mega menu item 3
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 2</MegaMenuHeader>
                <MegaMenuItem value="Mega menu item 4">
                  Mega menu item 4
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 5">
                  Mega menu item 5
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 6">
                  Mega menu item 6
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 3</MegaMenuHeader>
                <MegaMenuItem value="Mega menu item 7">
                  Mega menu item 7
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 8">
                  Mega menu item 8
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 9">
                  Mega menu item 9
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Menu Header 4</MegaMenuHeader>
                <MegaMenuItem value="Mega menu item 10">
                  Mega menu item 10
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 11">
                  Mega menu item 11
                </MegaMenuItem>
                <MegaMenuItem value="Mega menu item 12">
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
            <MegaMenuItem value="Analytics workspace">
              Analytics workspace
            </MegaMenuItem>
            <MegaMenuItem value="Order management">
              Order management
            </MegaMenuItem>
            <MegaMenuItem value="Pricing configurator">
              Pricing configurator
            </MegaMenuItem>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuHeader>Solutions</MegaMenuHeader>
            <MegaMenuItem value="Risk monitoring">Risk monitoring</MegaMenuItem>
            <MegaMenuItem value="Client reporting">
              Client reporting
            </MegaMenuItem>
            <MegaMenuItem value="Trade automation">
              Trade automation
            </MegaMenuItem>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuHeader>Resources</MegaMenuHeader>
            <MegaMenuItem value="Documentation">Documentation</MegaMenuItem>
            <MegaMenuItem value="Release notes">Release notes</MegaMenuItem>
            <MegaMenuItem value="Developer API">Developer API</MegaMenuItem>
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
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem value="Digital banking">
                    Digital banking
                  </MegaMenuItem>
                  <MegaMenuItem value="Risk management">
                    Risk management
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem value="Patient management">
                    Patient management
                  </MegaMenuItem>
                  <MegaMenuItem value="Telemedicine">Telemedicine</MegaMenuItem>
                  <MegaMenuItem value="Compliance solutions">
                    Compliance solutions
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem value="E-commerce platforms">
                    E-commerce platforms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem value="Supply chain optimization">
                    Supply chain optimization
                  </MegaMenuItem>
                  <MegaMenuItem value="Quality control">
                    Quality control
                  </MegaMenuItem>
                  <MegaMenuItem value="Production planning">
                    Production planning
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
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem value="Digital banking">
                    Digital banking
                  </MegaMenuItem>
                  <MegaMenuItem value="Risk management">
                    Risk management
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem value="Patient management">
                    Patient management
                  </MegaMenuItem>
                  <MegaMenuItem value="Telemedicine">Telemedicine</MegaMenuItem>
                  <MegaMenuItem value="Compliance solutions">
                    Compliance solutions
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem value="E-commerce platforms">
                    E-commerce platforms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem value="Supply chain optimization">
                    Supply chain optimization
                  </MegaMenuItem>
                  <MegaMenuItem value="Quality control">
                    Quality control
                  </MegaMenuItem>
                  <MegaMenuItem value="Production planning">
                    Production planning
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
                <MegaMenuHeader>Financial Services</MegaMenuHeader>
                <MegaMenuItem value="Digital banking">
                  Digital banking
                </MegaMenuItem>
                <MegaMenuItem value="Risk management">
                  Risk management
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Healthcare</MegaMenuHeader>
                <MegaMenuItem value="Patient management">
                  Patient management
                </MegaMenuItem>
                <MegaMenuItem value="Telemedicine">Telemedicine</MegaMenuItem>
                <MegaMenuItem value="Compliance solutions">
                  Compliance solutions
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Retail</MegaMenuHeader>
                <MegaMenuItem value="E-commerce platforms">
                  E-commerce platforms
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                <MegaMenuItem value="Supply chain optimization">
                  Supply chain optimization
                </MegaMenuItem>
                <MegaMenuItem value="Quality control">
                  Quality control
                </MegaMenuItem>
                <MegaMenuItem value="Production planning">
                  Production planning
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
                <MegaMenuHeader>Financial Services</MegaMenuHeader>
                <MegaMenuItem value="Digital banking">
                  Digital banking
                </MegaMenuItem>
                <MegaMenuItem value="Risk management">
                  Risk management
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Healthcare</MegaMenuHeader>
                <MegaMenuItem value="Patient management">
                  Patient management
                </MegaMenuItem>
                <MegaMenuItem value="Telemedicine">Telemedicine</MegaMenuItem>
                <MegaMenuItem value="Compliance solutions">
                  Compliance solutions
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Retail</MegaMenuHeader>
                <MegaMenuItem value="E-commerce platforms">
                  E-commerce platforms
                </MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                <MegaMenuItem value="Supply chain optimization">
                  Supply chain optimization
                </MegaMenuItem>
                <MegaMenuItem value="Quality control">
                  Quality control
                </MegaMenuItem>
                <MegaMenuItem value="Production planning">
                  Production planning
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
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    undefined,
  );

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
      <StackLayout as="ol" direction="row" gap={1}>
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
              <NavigationItem active={activeMenu === "solutions"}>
                Solutions
              </NavigationItem>
            </MegaMenuTrigger>

            <MegaMenuPanel className="withLink-menu-container">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem
                    value="Digital banking"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Digital banking",
                      );
                    }}
                  >
                    Digital banking
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Risk management"
                    onClick={() => {
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
                    value="Patient management"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Patient management",
                      );
                    }}
                  >
                    Patient management
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Telemedicine"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Telemedicine",
                      );
                    }}
                  >
                    Telemedicine
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Compliance solutions"
                    onClick={() => {
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
                    value="E-commerce platforms"
                    onClick={() => {
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
                    value="Supply chain optimization"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Supply chain optimization",
                      );
                    }}
                  >
                    Supply chain optimization
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Quality control"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Quality control",
                      );
                    }}
                  >
                    Quality control
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Production planning"
                    onClick={() => {
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
                    value="Learning management systems"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Learning management systems",
                      );
                    }}
                  >
                    Learning management systems
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Virtual classrooms"
                    onClick={() => {
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
                    value="Document management"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Document management",
                      );
                    }}
                  >
                    Document management
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Citizen services"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Citizen services",
                      );
                    }}
                  >
                    Citizen services
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Public safety solutions"
                    onClick={() => {
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
            </MegaMenuPanel>
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
              <NavigationItem active={activeMenu === "services"}>
                Services
              </NavigationItem>
            </MegaMenuTrigger>

            <MegaMenuPanel className="withLink-menu-container">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Consulting</MegaMenuHeader>
                  <MegaMenuItem
                    value="Strategy"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Strategy",
                      );
                    }}
                  >
                    Strategy
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="IT"
                    onClick={() => {
                      console.log("[WithLink MegaMenu] selected value:", "IT");
                    }}
                  >
                    IT
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="HR"
                    onClick={() => {
                      console.log("[WithLink MegaMenu] selected value:", "HR");
                    }}
                  >
                    HR
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Marketing"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Marketing",
                      );
                    }}
                  >
                    Marketing
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Operations"
                    onClick={() => {
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
                    value="Onboarding"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Onboarding",
                      );
                    }}
                  >
                    Onboarding
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Migration"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Migration",
                      );
                    }}
                  >
                    Migration
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Customization"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Customization",
                      );
                    }}
                  >
                    Customization
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Training"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Training",
                      );
                    }}
                  >
                    Training
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Support"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Support",
                      );
                    }}
                  >
                    Support
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Testing"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Testing",
                      );
                    }}
                  >
                    Testing
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Rollout"
                    onClick={() => {
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
                    value="Online"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Online",
                      );
                    }}
                  >
                    Online
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="In-person"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "In-person",
                      );
                    }}
                  >
                    In-person
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Workshops"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Workshops",
                      );
                    }}
                  >
                    Workshops
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Certifications"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Certifications",
                      );
                    }}
                  >
                    Certifications
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Tutorials"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Tutorials",
                      );
                    }}
                  >
                    Tutorials
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Guides"
                    onClick={() => {
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
                  See all services
                </Link>
              </MegaMenuGroup>
            </MegaMenuPanel>
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
              <NavigationItem active={activeMenu === "resources"}>
                Resources
              </NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuPanel className="withLink-menu-container">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Documentation</MegaMenuHeader>
                  <MegaMenuItem
                    value="User guides"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "User guides",
                      );
                    }}
                  >
                    User guides
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="API reference"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "API reference",
                      );
                    }}
                  >
                    API reference
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Release notes"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Release notes",
                      );
                    }}
                  >
                    Release notes
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="FAQs"
                    onClick={() => {
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
                  <MegaMenuHeader>Support & Help</MegaMenuHeader>
                  <MegaMenuItem
                    value="Contact support"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Contact support",
                      );
                    }}
                  >
                    Contact support
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Community forum"
                    onClick={() => {
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Community forum",
                      );
                    }}
                  >
                    Community forum
                  </MegaMenuItem>
                  <MegaMenuItem
                    value="Troubleshooting"
                    onClick={() => {
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
                  See all resources
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
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    undefined,
  );

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
    <div className="small-viewport-wrapper">
      <nav>
        <StackLayout as="ol" direction="row" gap={1}>
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
                    <MegaMenuHeader>Financial Services</MegaMenuHeader>
                    <MegaMenuItem
                      value="Digital banking"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Digital banking",
                        );
                      }}
                    >
                      Digital banking
                    </MegaMenuItem>
                    <MegaMenuItem
                      value="Risk management"
                      onClick={() => {
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
                      value="Patient management"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Patient management",
                        );
                      }}
                    >
                      Patient management
                    </MegaMenuItem>
                    <MegaMenuItem
                      value="Telemedicine"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Telemedicine",
                        );
                      }}
                    >
                      Telemedicine
                    </MegaMenuItem>
                    <MegaMenuItem
                      value="Compliance solutions"
                      onClick={() => {
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
                      value="E-commerce platforms"
                      onClick={() => {
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
                      value="Supply chain optimization"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Supply chain optimization",
                        );
                      }}
                    >
                      Supply chain optimization
                    </MegaMenuItem>
                    <MegaMenuItem
                      value="Quality control"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Quality control",
                        );
                      }}
                    >
                      Quality control
                    </MegaMenuItem>
                    <MegaMenuItem
                      value="Production planning"
                      onClick={() => {
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
                      value="Learning management systems"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Learning management systems",
                        );
                      }}
                    >
                      Learning management systems
                    </MegaMenuItem>
                    <MegaMenuItem
                      value="Virtual classrooms"
                      onClick={() => {
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
                      value="Document management"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Document management",
                        );
                      }}
                    >
                      Document management
                    </MegaMenuItem>
                    <MegaMenuItem
                      value="Citizen services"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Citizen services",
                        );
                      }}
                    >
                      Citizen services
                    </MegaMenuItem>
                    <MegaMenuItem
                      value="Public safety solutions"
                      onClick={() => {
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
              selectedItem={selectedItem}
              onSelectedItemChange={(value) =>
                handleSelectedItemChange("services", value)
              }
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
                    <MegaMenuItem value="Strategy">Strategy</MegaMenuItem>
                    <MegaMenuItem value="IT">IT</MegaMenuItem>
                    <MegaMenuItem value="HR">HR</MegaMenuItem>
                    <MegaMenuItem value="Marketing">Marketing</MegaMenuItem>
                    <MegaMenuItem value="Operations">Operations</MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Implementation</MegaMenuHeader>
                    <MegaMenuItem value="Onboarding">Onboarding</MegaMenuItem>
                    <MegaMenuItem value="Migration">Migration</MegaMenuItem>
                    <MegaMenuItem value="Customization">
                      Customization
                    </MegaMenuItem>
                    <MegaMenuItem value="Training">Training</MegaMenuItem>
                    <MegaMenuItem value="Support">Support</MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Training</MegaMenuHeader>
                    <MegaMenuItem value="Online">Online</MegaMenuItem>
                    <MegaMenuItem value="In-person">In-person</MegaMenuItem>
                    <MegaMenuItem value="Workshops">Workshops</MegaMenuItem>
                    <MegaMenuItem value="Certifications">
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
              selectedItem={selectedItem}
              onSelectedItemChange={(value) =>
                handleSelectedItemChange("resources", value)
              }
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
                    <MegaMenuItem value="User guides">User guides</MegaMenuItem>
                    <MegaMenuItem value="API reference">
                      API reference
                    </MegaMenuItem>
                    <MegaMenuItem value="Release notes">
                      Release notes
                    </MegaMenuItem>
                    <MegaMenuItem value="FAQs">FAQs</MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Support</MegaMenuHeader>
                    <MegaMenuItem value="Contact support">
                      Contact support
                    </MegaMenuItem>
                    <MegaMenuItem value="Community forum">
                      Community forum
                    </MegaMenuItem>
                    <MegaMenuItem value="Troubleshooting">
                      Troubleshooting
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Learn</MegaMenuHeader>
                    <MegaMenuItem value="Tutorials">Tutorials</MegaMenuItem>
                    <MegaMenuItem value="Guides">Guides</MegaMenuItem>
                    <MegaMenuItem value="Best practices">
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

export const DefaultSelectedItem: StoryFn = () => {
  return (
    <nav>
      <StackLayout as="ol" direction="row" gap={1}>
        <li>
          <MegaMenu defaultOpen defaultSelectedItem="Risk management">
            <MegaMenuTrigger>
              <NavigationItem>Solutions</NavigationItem>
            </MegaMenuTrigger>

            <MegaMenuPanel aria-label="Solutions menu">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem value="Digital banking">
                    Digital banking
                  </MegaMenuItem>
                  <MegaMenuItem value="Risk management">
                    Risk management
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem value="Patient management">
                    Patient management
                  </MegaMenuItem>
                  <MegaMenuItem value="Telemedicine">Telemedicine</MegaMenuItem>
                  <MegaMenuItem value="Compliance solutions">
                    Compliance solutions
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem value="E-commerce platforms">
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
                <MegaMenuItem value={`${placement}-1`}>Item 1</MegaMenuItem>
                <MegaMenuItem value={`${placement}-2`}>Item 2</MegaMenuItem>
                <MegaMenuItem value={`${placement}-3`}>Item 3</MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Group B</MegaMenuHeader>
                <MegaMenuItem value={`${placement}-4`}>Item 4</MegaMenuItem>
                <MegaMenuItem value={`${placement}-5`}>Item 5</MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuSection>
          </MegaMenuPanel>
        </MegaMenu>
      ))}
    </StackLayout>
  );
};
