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
  MegaMenuHeading,
  MegaMenuLink,
  MegaMenuList,
  MegaMenuMain,
  MegaMenuPanel,
  MegaMenuSection,
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
                <MegaMenuMain>
                  <MegaMenuSection>
                    <MegaMenuHeading>Financial services</MegaMenuHeading>
                    <MegaMenuList>
                      <MegaMenuLink
                        render={<Link to="/digital-banking" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/digital-banking",
                          )
                        }
                      >
                        <DevicesIcon aria-hidden />
                        Digital banking
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/risk-management" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/risk-management",
                          )
                        }
                      >
                        <DatasetManagerIcon aria-hidden />
                        Risk management
                      </MegaMenuLink>
                    </MegaMenuList>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Healthcare</MegaMenuHeading>
                    <MegaMenuList>
                      <MegaMenuLink
                        render={<Link to="/patient-management" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/patient-management",
                          )
                        }
                      >
                        <UserSearchIcon aria-hidden />
                        Patient management
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/telemedicine" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/telemedicine")
                        }
                      >
                        <CallIcon aria-hidden />
                        Telemedicine
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/compliance-solutions" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/compliance-solutions",
                          )
                        }
                      >
                        <PasteIcon aria-hidden />
                        Compliance solutions
                      </MegaMenuLink>
                    </MegaMenuList>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Retail</MegaMenuHeading>
                    <MegaMenuList>
                      <MegaMenuLink
                        render={<Link to="/e-commerce-platforms" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/e-commerce-platforms",
                          )
                        }
                      >
                        <CartIcon aria-hidden />
                        E-commerce platforms
                      </MegaMenuLink>
                    </MegaMenuList>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Manufacturing</MegaMenuHeading>
                    <MegaMenuList>
                      <MegaMenuLink
                        render={<Link to="/supply-chain-optimization" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/supply-chain-optimization",
                          )
                        }
                      >
                        <LinkedIcon aria-hidden />
                        Supply chain optimization
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/quality-control" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/quality-control",
                          )
                        }
                      >
                        <SettingsIcon aria-hidden />
                        Quality control
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/production-planning" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/production-planning",
                          )
                        }
                      >
                        <NotificationIcon aria-hidden />
                        Production planning
                      </MegaMenuLink>
                    </MegaMenuList>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Education</MegaMenuHeading>
                    <MegaMenuList>
                      <MegaMenuLink
                        render={<Link to="/learning-management-systems" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/learning-management-systems",
                          )
                        }
                      >
                        <GuideOpenIcon aria-hidden />
                        Learning management systems
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/virtual-classrooms" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/virtual-classrooms",
                          )
                        }
                      >
                        <LaptopIcon aria-hidden />
                        Virtual classrooms
                      </MegaMenuLink>
                    </MegaMenuList>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Government</MegaMenuHeading>
                    <MegaMenuList>
                      <MegaMenuLink
                        render={<Link to="/document-management" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/document-management",
                          )
                        }
                      >
                        <DocumentIcon aria-hidden />
                        Document management
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/citizen-services" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/citizen-services",
                          )
                        }
                      >
                        <PinIcon aria-hidden />
                        Citizen services
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/public-safety-solutions" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/public-safety-solutions",
                          )
                        }
                      >
                        <UserGroupIcon aria-hidden />
                        Public safety solutions
                      </MegaMenuLink>
                    </MegaMenuList>
                  </MegaMenuSection>
                </MegaMenuMain>
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
                <MegaMenuMain>
                  <MegaMenuSection>
                    <MegaMenuHeading>Consulting</MegaMenuHeading>
                    <MegaMenuList>
                      <MegaMenuLink
                        render={<Link to="/strategy" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/strategy")
                        }
                      >
                        <ChartBubbleIcon aria-hidden />
                        Strategy
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/it" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/it")
                        }
                      >
                        <LaptopIcon aria-hidden />
                        IT
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/hr" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/hr")
                        }
                      >
                        <UserGroupIcon aria-hidden />
                        HR
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/marketing" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/marketing")
                        }
                      >
                        <MarkerIcon aria-hidden />
                        Marketing
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/operations" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/operations")
                        }
                      >
                        <SettingsIcon aria-hidden />
                        Operations
                      </MegaMenuLink>
                    </MegaMenuList>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Implementation</MegaMenuHeading>
                    <MegaMenuList>
                      <MegaMenuLink
                        render={<Link to="/onboarding" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/onboarding")
                        }
                      >
                        <PasteIcon aria-hidden />
                        Onboarding
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/migration" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/migration")
                        }
                      >
                        <SwapIcon aria-hidden />
                        Migration
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/customization" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/customization")
                        }
                      >
                        <PinIcon aria-hidden />
                        Customization
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/training" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/training")
                        }
                      >
                        <GuideClosedIcon aria-hidden />
                        Training
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/support" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/support")
                        }
                      >
                        <InfoIcon aria-hidden />
                        Support
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/testing" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/testing")
                        }
                      >
                        <MaintenanceIcon aria-hidden />
                        Testing
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/rollout" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/rollout")
                        }
                      >
                        <SaveIcon aria-hidden />
                        Rollout
                      </MegaMenuLink>
                    </MegaMenuList>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Training</MegaMenuHeading>
                    <MegaMenuList>
                      <MegaMenuLink
                        render={<Link to="/online" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/online")
                        }
                      >
                        <DisplayIcon aria-hidden />
                        Online
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/in-person" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/in-person")
                        }
                      >
                        <UserIcon aria-hidden />
                        In-person
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/workshops" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/workshops")
                        }
                      >
                        <KeyIcon aria-hidden />
                        Workshops
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/certifications" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/certifications",
                          )
                        }
                      >
                        <DocumentIcon aria-hidden />
                        Certifications
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/tutorials" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/tutorials")
                        }
                      >
                        <DocumentEditIcon aria-hidden />
                        Tutorials
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/guides" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/guides")
                        }
                      >
                        <GuideOpenIcon aria-hidden />
                        Guides
                      </MegaMenuLink>
                    </MegaMenuList>
                  </MegaMenuSection>
                </MegaMenuMain>
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
                <MegaMenuMain>
                  <MegaMenuSection>
                    <MegaMenuHeading>Documentation</MegaMenuHeading>
                    <MegaMenuList>
                      <MegaMenuLink
                        render={<Link to="/user-guides" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/user-guides")
                        }
                      >
                        <GuideClosedIcon aria-hidden />
                        User guides
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/api-reference" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/api-reference")
                        }
                      >
                        <ApiIcon aria-hidden />
                        API reference
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/release-notes" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/release-notes")
                        }
                      >
                        <NotificationIcon aria-hidden />
                        Release notes
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/faqs" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/faqs")
                        }
                      >
                        <HelpIcon aria-hidden />
                        FAQs
                      </MegaMenuLink>
                    </MegaMenuList>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Support & help</MegaMenuHeading>
                    <MegaMenuList>
                      <MegaMenuLink
                        render={<Link to="/contact-support" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/contact-support",
                          )
                        }
                      >
                        <InfoIcon aria-hidden />
                        Contact support
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/community-forum" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/community-forum",
                          )
                        }
                      >
                        <ChatGroupIcon aria-hidden />
                        Community forum
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/troubleshooting" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/troubleshooting",
                          )
                        }
                      >
                        <AnnouncementIcon aria-hidden />
                        Troubleshooting
                      </MegaMenuLink>
                    </MegaMenuList>
                  </MegaMenuSection>
                </MegaMenuMain>
              </MegaMenuPanel>
            </MegaMenu>
          </li>
        </StackLayout>
      </nav>
    </MockHistory>
  );
};
