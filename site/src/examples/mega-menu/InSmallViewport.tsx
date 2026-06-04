import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuHeading,
  MegaMenuLink,
  MegaMenuMain,
  MegaMenuPanel,
  MegaMenuSection,
  MegaMenuTrigger,
} from "@salt-ds/lab";
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
      <div className={styles.smallViewportWrapper}>
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
                  className={styles.smallViewportContainer}
                  aria-label="Solutions menu"
                >
                  <MegaMenuMain>
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
                        Patient management
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/telemedicine" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/telemedicine")
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
                      <MegaMenuLink
                        render={<Link to="/production-planning" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/production-planning",
                          )
                        }
                      >
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
                      <MegaMenuLink
                        render={<Link to="/public-safety-solutions" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/public-safety-solutions",
                          )
                        }
                      >
                        Public safety solutions
                      </MegaMenuLink>
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
                  className={styles.smallViewportContainer}
                  aria-label="Services menu"
                >
                  <MegaMenuMain>
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
                        render={<Link to="/it" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/it")
                        }
                      >
                        IT
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/hr" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/hr")
                        }
                      >
                        HR
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/marketing" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/marketing")
                        }
                      >
                        Marketing
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
                      <MegaMenuLink
                        render={<Link to="/customization" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/customization")
                        }
                      >
                        Customization
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/training" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/training")
                        }
                      >
                        Training
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/support" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/support")
                        }
                      >
                        Support
                      </MegaMenuLink>
                    </MegaMenuSection>
                    <MegaMenuSection>
                      <MegaMenuHeading>Training</MegaMenuHeading>
                      <MegaMenuLink
                        render={<Link to="/online" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/online")
                        }
                      >
                        Online
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/in-person" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/in-person")
                        }
                      >
                        In-person
                      </MegaMenuLink>
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
                  className={styles.smallViewportContainer}
                  aria-label="Resources menu"
                >
                  <MegaMenuMain>
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
                      <MegaMenuLink
                        render={<Link to="/release-notes" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/release-notes")
                        }
                      >
                        Release notes
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/faqs" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/faqs")
                        }
                      >
                        FAQs
                      </MegaMenuLink>
                    </MegaMenuSection>
                    <MegaMenuSection>
                      <MegaMenuHeading>Support</MegaMenuHeading>
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
                      <MegaMenuLink
                        render={<Link to="/troubleshooting" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/troubleshooting",
                          )
                        }
                      >
                        Troubleshooting
                      </MegaMenuLink>
                    </MegaMenuSection>
                    <MegaMenuSection>
                      <MegaMenuHeading>Learn</MegaMenuHeading>
                      <MegaMenuLink
                        render={<Link to="/tutorials" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/tutorials")
                        }
                      >
                        Tutorials
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/guides" />}
                        onClick={() =>
                          console.log("MegaMenuLink clicked:", "/guides")
                        }
                      >
                        Guides
                      </MegaMenuLink>
                      <MegaMenuLink
                        render={<Link to="/best-practices" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuLink clicked:",
                            "/best-practices",
                          )
                        }
                      >
                        Best practices
                      </MegaMenuLink>
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
