import { NavigationItem, StackLayout } from "@salt-ds/core";
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
      <div className={styles.fullWidthWrapper}>
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
                  className={styles.fullWidthPanel}
                >
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
                          Patient management
                        </MegaMenuLink>
                        <MegaMenuLink
                          render={<Link to="/telemedicine" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuLink clicked:",
                              "/telemedicine",
                            )
                          }
                        >
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
                          Quality control
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
                          Citizen services
                        </MegaMenuLink>
                      </MegaMenuList>
                    </MegaMenuSection>
                    <MegaMenuSection>
                      <MegaMenuHeading>Technology</MegaMenuHeading>
                      <MegaMenuList>
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
                            console.log(
                              "MegaMenuLink clicked:",
                              "/cybersecurity",
                            )
                          }
                        >
                          Cybersecurity
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
                <MegaMenuPanel
                  aria-label="Services menu"
                  className={styles.fullWidthPanel}
                >
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
                      </MegaMenuList>
                    </MegaMenuSection>
                    <MegaMenuSection>
                      <MegaMenuHeading>Training</MegaMenuHeading>
                      <MegaMenuList>
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
                <MegaMenuPanel
                  aria-label="Resources menu"
                  className={styles.fullWidthPanel}
                >
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
                          User guides
                        </MegaMenuLink>
                        <MegaMenuLink
                          render={<Link to="/api-reference" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuLink clicked:",
                              "/api-reference",
                            )
                          }
                        >
                          API reference
                        </MegaMenuLink>
                      </MegaMenuList>
                    </MegaMenuSection>
                    <MegaMenuSection>
                      <MegaMenuHeading>Support &amp; help</MegaMenuHeading>
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
                      </MegaMenuList>
                    </MegaMenuSection>
                  </MegaMenuMain>
                </MegaMenuPanel>
              </MegaMenu>
            </li>
          </StackLayout>
        </nav>
      </div>
    </MockHistory>
  );
};
