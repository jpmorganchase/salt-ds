import { FlexLayout, Link, NavigationItem, StackLayout } from "@salt-ds/core";
import { ChevronRightIcon } from "@salt-ds/icons";
import {
  MegaMenu,
  MegaMenuFooter,
  MegaMenuSection,
  MegaMenuGroups,
  MegaMenuHeading,
  MegaMenuLink,
  MegaMenuPanel,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";
import { Link as RouterLink } from "react-router";
import styles from "./index.module.css";
import { MockHistory } from "./MockHistory";

export const WithLink = (): ReactElement => {
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
              >
                <MegaMenuGroups>
                  <MegaMenuSection>
                    <MegaMenuHeading>Financial services</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/digital-banking" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/digital-banking")
                      }
                    >
                      Digital banking
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/risk-management" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/risk-management")
                      }
                    >
                      Risk management
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Healthcare</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/patient-management" />}
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
                      render={<RouterLink to="/telemedicine" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/telemedicine")
                      }
                    >
                      Telemedicine
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/compliance-solutions" />}
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
                      render={<RouterLink to="/e-commerce-platforms" />}
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
                      render={<RouterLink to="/supply-chain-optimization" />}
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
                      render={<RouterLink to="/quality-control" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/quality-control")
                      }
                    >
                      Quality control
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/production-planning" />}
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
                      render={<RouterLink to="/learning-management-systems" />}
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
                      render={<RouterLink to="/virtual-classrooms" />}
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
                      render={<RouterLink to="/document-management" />}
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
                      render={<RouterLink to="/citizen-services" />}
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
                      render={<RouterLink to="/public-safety-solutions" />}
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
                </MegaMenuGroups>
                <MegaMenuFooter>
                  <FlexLayout wrap gap={3}>
                    <Link
                      color="primary"
                      underline="default"
                      href="#link"
                      IconComponent={ChevronRightIcon}
                    >
                      Book a demo
                    </Link>
                    <Link
                      color="primary"
                      underline="default"
                      href="#link"
                      IconComponent={ChevronRightIcon}
                    >
                      Support center
                    </Link>
                  </FlexLayout>
                </MegaMenuFooter>
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
              >
                <MegaMenuGroups>
                  <MegaMenuSection>
                    <MegaMenuHeading>Consulting</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/strategy" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/strategy")
                      }
                    >
                      Strategy
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/it" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/it")
                      }
                    >
                      IT
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/hr" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/hr")
                      }
                    >
                      HR
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/marketing" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/marketing")
                      }
                    >
                      Marketing
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/operations" />}
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
                      render={<RouterLink to="/onboarding" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/onboarding")
                      }
                    >
                      Onboarding
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/migration" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/migration")
                      }
                    >
                      Migration
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/customization" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/customization")
                      }
                    >
                      Customization
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/training" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/training")
                      }
                    >
                      Training
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/support" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/support")
                      }
                    >
                      Support
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/testing" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/testing")
                      }
                    >
                      Testing
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/rollout" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/rollout")
                      }
                    >
                      Rollout
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Training</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/online" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/online")
                      }
                    >
                      Online
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/in-person" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/in-person")
                      }
                    >
                      In-person
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/workshops" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/workshops")
                      }
                    >
                      Workshops
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/certifications" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/certifications")
                      }
                    >
                      Certifications
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/tutorials" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/tutorials")
                      }
                    >
                      Tutorials
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/guides" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/guides")
                      }
                    >
                      Guides
                    </MegaMenuLink>
                  </MegaMenuSection>
                </MegaMenuGroups>
                <MegaMenuFooter>
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    Service status
                  </Link>
                </MegaMenuFooter>
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
              >
                <MegaMenuGroups>
                  <MegaMenuSection>
                    <MegaMenuHeading>Documentation</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/user-guides" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/user-guides")
                      }
                    >
                      User guides
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/api-reference" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/api-reference")
                      }
                    >
                      API reference
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/release-notes" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/release-notes")
                      }
                    >
                      Release notes
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/faqs" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/faqs")
                      }
                    >
                      FAQs
                    </MegaMenuLink>
                  </MegaMenuSection>
                  <MegaMenuSection>
                    <MegaMenuHeading>Support & help</MegaMenuHeading>
                    <MegaMenuLink
                      render={<RouterLink to="/contact-support" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/contact-support")
                      }
                    >
                      Contact support
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/community-forum" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/community-forum")
                      }
                    >
                      Community forum
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<RouterLink to="/troubleshooting" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/troubleshooting")
                      }
                    >
                      Troubleshooting
                    </MegaMenuLink>
                  </MegaMenuSection>
                </MegaMenuGroups>
                <MegaMenuFooter>
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    Browse documentation
                  </Link>
                </MegaMenuFooter>
              </MegaMenuPanel>
            </MegaMenu>
          </li>
        </StackLayout>
      </nav>
    </MockHistory>
  );
};
