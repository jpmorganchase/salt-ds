import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  CallIcon,
  CartIcon,
  DatasetManagerIcon,
  DevicesIcon,
  DocumentIcon,
  GuideOpenIcon,
  LaptopIcon,
  LinkedIcon,
  NotificationIcon,
  PasteIcon,
  PinIcon,
  SettingsIcon,
  UserGroupIcon,
  UserSearchIcon,
} from "@salt-ds/icons";
import {
  MegaMenu,
  MegaMenuSection,
  MegaMenuGroups,
  MegaMenuHeading,
  MegaMenuLink,
  MegaMenuPanel,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";
import { Link } from "react-router";
import styles from "./index.module.css";
import { MockHistory } from "./MockHistory";

export const EdgeToEdge = (): ReactElement => {
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
      <div className={styles.edgeToEdgeWrapper}>
        <nav>
          <StackLayout
            as="ol"
            direction="row"
            gap={1}
            className={styles.navList}
          >
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
                  className={styles.edgeToEdgePanel}
                >
                  <MegaMenuGroups>
                    <MegaMenuSection>
                      <MegaMenuHeading>Financial services</MegaMenuHeading>
                      <MegaMenuLink
                        render={<Link to="/digital-banking" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/digital-banking",
                          )
                        }
                      >
                        <DevicesIcon
                          aria-hidden
                          className="saltMegaMenuLink-icon"
                        />
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
                        render={<Link to="/patient-management" />}
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
                        render={<Link to="/telemedicine" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/telemedicine")
                        }
                      >
                        <CallIcon
                          aria-hidden
                          className="saltMegaMenuLink-icon"
                        />
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
                        render={<Link to="/e-commerce-platforms" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/e-commerce-platforms",
                          )
                        }
                      >
                        <CartIcon
                          aria-hidden
                          className="saltMegaMenuLink-icon"
                        />
                        E-commerce platforms
                      </MegaMenuLink>
                    </MegaMenuSection>
                    <MegaMenuSection>
                      <MegaMenuHeading>Manufacturing</MegaMenuHeading>
                      <MegaMenuLink
                        render={<Link to="/supply-chain-optimization" />}
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
                        render={<Link to="/quality-control" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/quality-control",
                          )
                        }
                      >
                        <SettingsIcon
                          aria-hidden
                          className="saltMegaMenuLink-icon"
                        />
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
                        render={<Link to="/learning-management-systems" />}
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
                        render={<Link to="/virtual-classrooms" />}
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
                        render={<Link to="/document-management" />}
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
                        render={<Link to="/citizen-services" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/citizen-services",
                          )
                        }
                      >
                        <PinIcon
                          aria-hidden
                          className="saltMegaMenuLink-icon"
                        />
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
                        render={<Link to="/cloud-solutions" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/cloud-solutions",
                          )
                        }
                      >
                        Cloud solutions
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/cybersecurity" />}
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
                        render={<Link to="/smart-grid-management" />}
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
                        render={<Link to="/renewable-integration" />}
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
                  className={styles.edgeToEdgePanel}
                >
                  <MegaMenuGroups>
                    <MegaMenuSection>
                      <MegaMenuHeading>Consulting</MegaMenuHeading>
                      <MegaMenuLink
                        render={<Link to="/strategy" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/strategy")
                        }
                      >
                        Strategy
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/operations" />}
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
                        render={<Link to="/onboarding" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/onboarding")
                        }
                      >
                        Onboarding
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/migration" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/migration")
                        }
                      >
                        Migration
                      </MegaMenuLink>
                    </MegaMenuSection>
                    <MegaMenuSection>
                      <MegaMenuHeading>Training</MegaMenuHeading>
                      <MegaMenuLink
                        render={<Link to="/workshops" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/workshops")
                        }
                      >
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
                  aria-label="Resources menu"
                  className={styles.edgeToEdgePanel}
                >
                  <MegaMenuGroups>
                    <MegaMenuSection>
                      <MegaMenuHeading>Documentation</MegaMenuHeading>
                      <MegaMenuLink
                        render={<Link to="/user-guides" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/user-guides")
                        }
                      >
                        User guides
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/api-reference" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/api-reference")
                        }
                      >
                        API reference
                      </MegaMenuLink>
                    </MegaMenuSection>
                    <MegaMenuSection>
                      <MegaMenuHeading>Support &amp; help</MegaMenuHeading>
                      <MegaMenuLink
                        render={<Link to="/contact-support" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/contact-support",
                          )
                        }
                      >
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
                        Community forum
                      </MegaMenuLink>
                    </MegaMenuSection>
                  </MegaMenuGroups>
                </MegaMenuPanel>
              </MegaMenu>
            </li>
          </StackLayout>
        </nav>
      </div>
    </MockHistory>
  );
};
