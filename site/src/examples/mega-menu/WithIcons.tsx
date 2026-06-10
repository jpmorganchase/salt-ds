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
  MegaMenuBody,
  MegaMenuGroup,
  MegaMenuGroupHeading,
  MegaMenuGroups,
  MegaMenuItem,
  MegaMenuItemList,
  MegaMenuPanel,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";
import { Link } from "react-router";
import styles from "./index.module.css";
import { MockHistory } from "./MockHistory";

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
    <MockHistory>
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
                <MegaMenuBody>
                  <MegaMenuGroups>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>
                        Financial services
                      </MegaMenuGroupHeading>
                      <MegaMenuItemList>
                        <MegaMenuItem
                          render={<Link to="/digital-banking" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/digital-banking",
                            )
                          }
                        >
                          <DevicesIcon aria-hidden />
                          Digital banking
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/risk-management" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/risk-management",
                            )
                          }
                        >
                          <DatasetManagerIcon aria-hidden />
                          Risk management
                        </MegaMenuItem>
                      </MegaMenuItemList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
                      <MegaMenuItemList>
                        <MegaMenuItem
                          render={<Link to="/patient-management" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/patient-management",
                            )
                          }
                        >
                          <UserSearchIcon aria-hidden />
                          Patient management
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/telemedicine" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/telemedicine",
                            )
                          }
                        >
                          <CallIcon aria-hidden />
                          Telemedicine
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/compliance-solutions" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/compliance-solutions",
                            )
                          }
                        >
                          <PasteIcon aria-hidden />
                          Compliance solutions
                        </MegaMenuItem>
                      </MegaMenuItemList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Retail</MegaMenuGroupHeading>
                      <MegaMenuItemList>
                        <MegaMenuItem
                          render={<Link to="/e-commerce-platforms" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/e-commerce-platforms",
                            )
                          }
                        >
                          <CartIcon aria-hidden />
                          E-commerce platforms
                        </MegaMenuItem>
                      </MegaMenuItemList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Manufacturing</MegaMenuGroupHeading>
                      <MegaMenuItemList>
                        <MegaMenuItem
                          render={<Link to="/supply-chain-optimization" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/supply-chain-optimization",
                            )
                          }
                        >
                          <LinkedIcon aria-hidden />
                          Supply chain optimization
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/quality-control" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/quality-control",
                            )
                          }
                        >
                          <SettingsIcon aria-hidden />
                          Quality control
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/production-planning" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/production-planning",
                            )
                          }
                        >
                          <NotificationIcon aria-hidden />
                          Production planning
                        </MegaMenuItem>
                      </MegaMenuItemList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Education</MegaMenuGroupHeading>
                      <MegaMenuItemList>
                        <MegaMenuItem
                          render={<Link to="/learning-management-systems" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/learning-management-systems",
                            )
                          }
                        >
                          <GuideOpenIcon aria-hidden />
                          Learning management systems
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/virtual-classrooms" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/virtual-classrooms",
                            )
                          }
                        >
                          <LaptopIcon aria-hidden />
                          Virtual classrooms
                        </MegaMenuItem>
                      </MegaMenuItemList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Government</MegaMenuGroupHeading>
                      <MegaMenuItemList>
                        <MegaMenuItem
                          render={<Link to="/document-management" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/document-management",
                            )
                          }
                        >
                          <DocumentIcon aria-hidden />
                          Document management
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/citizen-services" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/citizen-services",
                            )
                          }
                        >
                          <PinIcon aria-hidden />
                          Citizen services
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/public-safety-solutions" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/public-safety-solutions",
                            )
                          }
                        >
                          <UserGroupIcon aria-hidden />
                          Public safety solutions
                        </MegaMenuItem>
                      </MegaMenuItemList>
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
                      <MegaMenuItemList>
                        <MegaMenuItem
                          render={<Link to="/strategy" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/strategy")
                          }
                        >
                          <ChartBubbleIcon aria-hidden />
                          Strategy
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/it" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/it")
                          }
                        >
                          <LaptopIcon aria-hidden />
                          IT
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/hr" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/hr")
                          }
                        >
                          <UserGroupIcon aria-hidden />
                          HR
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/marketing" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/marketing")
                          }
                        >
                          <MarkerIcon aria-hidden />
                          Marketing
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/operations" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/operations")
                          }
                        >
                          <SettingsIcon aria-hidden />
                          Operations
                        </MegaMenuItem>
                      </MegaMenuItemList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>
                        Implementation
                      </MegaMenuGroupHeading>
                      <MegaMenuItemList>
                        <MegaMenuItem
                          render={<Link to="/onboarding" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/onboarding")
                          }
                        >
                          <PasteIcon aria-hidden />
                          Onboarding
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/migration" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/migration")
                          }
                        >
                          <SwapIcon aria-hidden />
                          Migration
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/customization" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/customization",
                            )
                          }
                        >
                          <PinIcon aria-hidden />
                          Customization
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/training" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/training")
                          }
                        >
                          <GuideClosedIcon aria-hidden />
                          Training
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/support" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/support")
                          }
                        >
                          <InfoIcon aria-hidden />
                          Support
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/testing" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/testing")
                          }
                        >
                          <MaintenanceIcon aria-hidden />
                          Testing
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/rollout" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/rollout")
                          }
                        >
                          <SaveIcon aria-hidden />
                          Rollout
                        </MegaMenuItem>
                      </MegaMenuItemList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Training</MegaMenuGroupHeading>
                      <MegaMenuItemList>
                        <MegaMenuItem
                          render={<Link to="/online" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/online")
                          }
                        >
                          <DisplayIcon aria-hidden />
                          Online
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/in-person" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/in-person")
                          }
                        >
                          <UserIcon aria-hidden />
                          In-person
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/workshops" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/workshops")
                          }
                        >
                          <KeyIcon aria-hidden />
                          Workshops
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/certifications" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/certifications",
                            )
                          }
                        >
                          <DocumentIcon aria-hidden />
                          Certifications
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/tutorials" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/tutorials")
                          }
                        >
                          <DocumentEditIcon aria-hidden />
                          Tutorials
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/guides" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/guides")
                          }
                        >
                          <GuideOpenIcon aria-hidden />
                          Guides
                        </MegaMenuItem>
                      </MegaMenuItemList>
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
                      <MegaMenuItemList>
                        <MegaMenuItem
                          render={<Link to="/user-guides" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/user-guides")
                          }
                        >
                          <GuideClosedIcon aria-hidden />
                          User guides
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/api-reference" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/api-reference",
                            )
                          }
                        >
                          <ApiIcon aria-hidden />
                          API reference
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/release-notes" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/release-notes",
                            )
                          }
                        >
                          <NotificationIcon aria-hidden />
                          Release notes
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/faqs" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/faqs")
                          }
                        >
                          <HelpIcon aria-hidden />
                          FAQs
                        </MegaMenuItem>
                      </MegaMenuItemList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>
                        Support & help
                      </MegaMenuGroupHeading>
                      <MegaMenuItemList>
                        <MegaMenuItem
                          render={<Link to="/contact-support" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/contact-support",
                            )
                          }
                        >
                          <InfoIcon aria-hidden />
                          Contact support
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/community-forum" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/community-forum",
                            )
                          }
                        >
                          <ChatGroupIcon aria-hidden />
                          Community forum
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/troubleshooting" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/troubleshooting",
                            )
                          }
                        >
                          <AnnouncementIcon aria-hidden />
                          Troubleshooting
                        </MegaMenuItem>
                      </MegaMenuItemList>
                    </MegaMenuGroup>
                  </MegaMenuGroups>
                </MegaMenuBody>
              </MegaMenuPanel>
            </MegaMenu>
          </li>
        </StackLayout>
      </nav>
    </MockHistory>
  );
};
