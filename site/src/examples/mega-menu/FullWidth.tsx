import { NavigationItem, StackLayout } from "@salt-ds/core";
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

export const FullWidth = (): ReactElement => {
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
              <MegaMenuPanel
                aria-label="Solutions menu"
                className={styles.fullWidthPanel}
              >
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
                          Quality control
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
                          Citizen services
                        </MegaMenuItem>
                      </MegaMenuItemList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Technology</MegaMenuGroupHeading>
                      <MegaMenuItemList>
                        <MegaMenuItem
                          render={<Link to="/cloud-solutions" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/cloud-solutions",
                            )
                          }
                        >
                          Cloud solutions
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/cybersecurity" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/cybersecurity",
                            )
                          }
                        >
                          Cybersecurity
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
              <MegaMenuPanel
                aria-label="Services menu"
                className={styles.fullWidthPanel}
              >
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
                          Strategy
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/operations" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/operations")
                          }
                        >
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
                          Onboarding
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/migration" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/migration")
                          }
                        >
                          Migration
                        </MegaMenuItem>
                      </MegaMenuItemList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Training</MegaMenuGroupHeading>
                      <MegaMenuItemList>
                        <MegaMenuItem
                          render={<Link to="/workshops" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/workshops")
                          }
                        >
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
                          Certifications
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
              <MegaMenuPanel
                aria-label="Resources menu"
                className={styles.fullWidthPanel}
              >
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
                          API reference
                        </MegaMenuItem>
                      </MegaMenuItemList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>
                        Support &amp; help
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
                          Community forum
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
