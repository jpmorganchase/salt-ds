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
  NavigationItem,
  StackLayout,
} from "@salt-ds/core";

import { type ReactElement, useState } from "react";
import { Link } from "react-router";
import styles from "./index.module.css";
import { MockHistory } from "./MockHistory";

export const InSmallViewport = (): ReactElement => {
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
      <nav aria-label="in small viewport">
        <StackLayout as="ul" direction="row" gap={1} className={styles.navList}>
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
                className={styles.smallViewportContainer}
                aria-label="Solutions menu"
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
                className={styles.smallViewportContainer}
                aria-label="Services menu"
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
                          render={<Link to="/it" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/it")
                          }
                        >
                          IT
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/hr" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/hr")
                          }
                        >
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
                        <MegaMenuListItem
                          render={<Link to="/customization" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/customization",
                            )
                          }
                        >
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
                          Training
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/support" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/support")
                          }
                        >
                          Support
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
                className={styles.smallViewportContainer}
                aria-label="Resources menu"
              >
                <MegaMenuContent>
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
                        <MegaMenuListItem
                          render={<Link to="/release-notes" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/release-notes",
                            )
                          }
                        >
                          Release notes
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/faqs" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/faqs")
                          }
                        >
                          FAQs
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Support</MegaMenuGroupHeading>
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
                        <MegaMenuListItem
                          render={<Link to="/troubleshooting" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/troubleshooting",
                            )
                          }
                        >
                          Troubleshooting
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Learn</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<Link to="/tutorials" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/tutorials",
                            )
                          }
                        >
                          Tutorials
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/guides" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/guides")
                          }
                        >
                          Guides
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/best-practices" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/best-practices",
                            )
                          }
                        >
                          Best practices
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
    </MockHistory>
  );
};
