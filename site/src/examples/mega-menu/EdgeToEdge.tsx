import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuContent,
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
        <nav aria-label="edge to edge">
          <StackLayout
            as="ul"
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
                  <MegaMenuContent>
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
                            E-commerce platforms
                          </MegaMenuListItem>
                        </MegaMenuList>
                      </MegaMenuGroup>
                      <MegaMenuGroup>
                        <MegaMenuGroupHeading>
                          Manufacturing
                        </MegaMenuGroupHeading>
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
                            Public safety solutions
                          </MegaMenuListItem>
                        </MegaMenuList>
                      </MegaMenuGroup>
                      <MegaMenuGroup>
                        <MegaMenuGroupHeading>Technology</MegaMenuGroupHeading>
                        <MegaMenuList>
                          <MegaMenuListItem
                            render={<Link to="/cloud-solutions" />}
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
                            render={<Link to="/cybersecurity" />}
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
                            render={<Link to="/smart-grid-management" />}
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
                            render={<Link to="/renewable-integration" />}
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
                  </MegaMenuContent>
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
                  <MegaMenuContent>
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
                            Strategy
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
                            Migration
                          </MegaMenuListItem>
                        </MegaMenuList>
                      </MegaMenuGroup>
                      <MegaMenuGroup>
                        <MegaMenuGroupHeading>Training</MegaMenuGroupHeading>
                        <MegaMenuList>
                          <MegaMenuListItem
                            render={<Link to="/workshops" />}
                            onClick={() =>
                              console.log(
                                "MegaMenuListItem clicked:",
                                "/workshops",
                              )
                            }
                          >
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
                            Certifications
                          </MegaMenuListItem>
                        </MegaMenuList>
                      </MegaMenuGroup>
                    </MegaMenuGroups>
                  </MegaMenuContent>
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
                  <MegaMenuContent>
                    <MegaMenuGroups>
                      <MegaMenuGroup>
                        <MegaMenuGroupHeading>
                          Documentation
                        </MegaMenuGroupHeading>
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
                            API reference
                          </MegaMenuListItem>
                        </MegaMenuList>
                      </MegaMenuGroup>
                      <MegaMenuGroup>
                        <MegaMenuGroupHeading>
                          Support &amp; help
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
                            Community forum
                          </MegaMenuListItem>
                        </MegaMenuList>
                      </MegaMenuGroup>
                    </MegaMenuGroups>
                  </MegaMenuContent>
                </MegaMenuPanel>
              </MegaMenu>
            </li>
          </StackLayout>
        </nav>
      </div>
    </MockHistory>
  );
};
