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
                  <MegaMenuItem>
                    <DevicesIcon aria-hidden />
                    <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <DatasetManagerIcon aria-hidden />
                    <MegaMenuItemContent>Risk management</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem>
                    <UserSearchIcon aria-hidden />
                    <MegaMenuItemContent>
                      Patient management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <CallIcon aria-hidden />
                    <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <PasteIcon aria-hidden />
                    <MegaMenuItemContent>
                      Compliance solutions
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem>
                    <CartIcon aria-hidden />
                    <MegaMenuItemContent>
                      E-commerce platforms
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem>
                    <LinkedIcon aria-hidden />
                    <MegaMenuItemContent>
                      Supply chain optimization
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <SettingsIcon aria-hidden />
                    <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <NotificationIcon aria-hidden />
                    <MegaMenuItemContent>
                      Production planning
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Education</MegaMenuHeader>
                  <MegaMenuItem>
                    <GuideOpenIcon aria-hidden />
                    <MegaMenuItemContent>
                      Learning management systems
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <LaptopIcon aria-hidden />
                    <MegaMenuItemContent>
                      Virtual classrooms
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Government</MegaMenuHeader>
                  <MegaMenuItem>
                    <DocumentIcon aria-hidden />
                    <MegaMenuItemContent>
                      Document management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <PinIcon aria-hidden />
                    <MegaMenuItemContent>Citizen services</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
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
                  <MegaMenuItem>
                    <ChartBubbleIcon aria-hidden />
                    <MegaMenuItemContent>Strategy</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <LaptopIcon aria-hidden />
                    <MegaMenuItemContent>IT</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <UserGroupIcon aria-hidden />
                    <MegaMenuItemContent>HR</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MarkerIcon aria-hidden />
                    <MegaMenuItemContent>Marketing</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <SettingsIcon aria-hidden />
                    <MegaMenuItemContent>Operations</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Implementation</MegaMenuHeader>
                  <MegaMenuItem>
                    <PasteIcon aria-hidden />
                    <MegaMenuItemContent>Onboarding</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <SwapIcon aria-hidden />
                    <MegaMenuItemContent>Migration</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <PinIcon aria-hidden />
                    <MegaMenuItemContent>Customization</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <GuideClosedIcon aria-hidden />
                    <MegaMenuItemContent>Training</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <InfoIcon aria-hidden />
                    <MegaMenuItemContent>Support</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <MaintenanceIcon aria-hidden />
                    <MegaMenuItemContent>Testing</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <SaveIcon aria-hidden />
                    <MegaMenuItemContent>Rollout</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem>
                    <DisplayIcon aria-hidden />
                    <MegaMenuItemContent>Online</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <UserIcon aria-hidden />
                    <MegaMenuItemContent>In-person</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <KeyIcon aria-hidden />
                    <MegaMenuItemContent>Workshops</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <DocumentIcon aria-hidden />
                    <MegaMenuItemContent>Certifications</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <DocumentEditIcon aria-hidden />
                    <MegaMenuItemContent>Tutorials</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
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
                  <MegaMenuItem>
                    <GuideClosedIcon aria-hidden />
                    <MegaMenuItemContent>User guides</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <ApiIcon aria-hidden />
                    <MegaMenuItemContent>API reference</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <NotificationIcon aria-hidden />
                    <MegaMenuItemContent>Release notes</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <HelpIcon aria-hidden />
                    <MegaMenuItemContent>FAQs</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & help</MegaMenuHeader>
                  <MegaMenuItem>
                    <InfoIcon aria-hidden />
                    <MegaMenuItemContent>Contact support</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
                    <ChatGroupIcon aria-hidden />
                    <MegaMenuItemContent>Community forum</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem>
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
