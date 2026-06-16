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
  MegaMenuList,
  MegaMenuListItem,
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
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<Link to="/digital-banking" />}
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
                          render={<Link to="/risk-management" />}
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
                          render={<Link to="/patient-management" />}
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
                          render={<Link to="/telemedicine" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/telemedicine",
                            )
                          }
                        >
                          <CallIcon aria-hidden />
                          Telemedicine
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/compliance-solutions" />}
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
                          render={<Link to="/e-commerce-platforms" />}
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
                          render={<Link to="/supply-chain-optimization" />}
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
                          render={<Link to="/quality-control" />}
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
                          render={<Link to="/production-planning" />}
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
                          render={<Link to="/learning-management-systems" />}
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
                          render={<Link to="/virtual-classrooms" />}
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
                          render={<Link to="/document-management" />}
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
                          render={<Link to="/citizen-services" />}
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
                          render={<Link to="/public-safety-solutions" />}
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
                          render={<Link to="/strategy" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/strategy",
                            )
                          }
                        >
                          <ChartBubbleIcon aria-hidden />
                          Strategy
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/it" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/it")
                          }
                        >
                          <LaptopIcon aria-hidden />
                          IT
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/hr" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/hr")
                          }
                        >
                          <UserGroupIcon aria-hidden />
                          HR
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/marketing" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/marketing",
                            )
                          }
                        >
                          <MarkerIcon aria-hidden />
                          Marketing
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/operations" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/operations",
                            )
                          }
                        >
                          <SettingsIcon aria-hidden />
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
                          render={<Link to="/onboarding" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/onboarding",
                            )
                          }
                        >
                          <PasteIcon aria-hidden />
                          Onboarding
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/migration" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/migration",
                            )
                          }
                        >
                          <SwapIcon aria-hidden />
                          Migration
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/customization" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/customization",
                            )
                          }
                        >
                          <PinIcon aria-hidden />
                          Customization
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/training" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/training",
                            )
                          }
                        >
                          <GuideClosedIcon aria-hidden />
                          Training
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/support" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/support")
                          }
                        >
                          <InfoIcon aria-hidden />
                          Support
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/testing" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/testing")
                          }
                        >
                          <MaintenanceIcon aria-hidden />
                          Testing
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/rollout" />}
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
                          render={<Link to="/online" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/online")
                          }
                        >
                          <DisplayIcon aria-hidden />
                          Online
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/in-person" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/in-person",
                            )
                          }
                        >
                          <UserIcon aria-hidden />
                          In-person
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/workshops" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/workshops",
                            )
                          }
                        >
                          <KeyIcon aria-hidden />
                          Workshops
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/certifications" />}
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
                          render={<Link to="/tutorials" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/tutorials",
                            )
                          }
                        >
                          <DocumentEditIcon aria-hidden />
                          Tutorials
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/guides" />}
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
                          render={<Link to="/user-guides" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/user-guides",
                            )
                          }
                        >
                          <GuideClosedIcon aria-hidden />
                          User guides
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/api-reference" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/api-reference",
                            )
                          }
                        >
                          <ApiIcon aria-hidden />
                          API reference
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/release-notes" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/release-notes",
                            )
                          }
                        >
                          <NotificationIcon aria-hidden />
                          Release notes
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/faqs" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/faqs")
                          }
                        >
                          <HelpIcon aria-hidden />
                          FAQs
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>
                        Support & help
                      </MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<Link to="/contact-support" />}
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
                          render={<Link to="/community-forum" />}
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
                          render={<Link to="/troubleshooting" />}
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
    </MockHistory>
  );
};
