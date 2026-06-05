import { FlexLayout, Link, NavigationItem, StackLayout } from "@salt-ds/core";
import { ChevronRightIcon } from "@salt-ds/icons";
import {
  MegaMenu,
  MegaMenuActionBar,
  MegaMenuBody,
  MegaMenuGroup,
  MegaMenuGroupHeading,
  MegaMenuItem,
  MegaMenuItemList,
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
              <MegaMenuPanel aria-label="Solutions menu">
                <MegaMenuBody>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>
                      Financial services
                    </MegaMenuGroupHeading>
                    <MegaMenuItemList>
                      <MegaMenuItem
                        render={<RouterLink to="/digital-banking" />}
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
                        render={<RouterLink to="/risk-management" />}
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
                        render={<RouterLink to="/patient-management" />}
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
                        render={<RouterLink to="/telemedicine" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/telemedicine")
                        }
                      >
                        Telemedicine
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/compliance-solutions" />}
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
                        render={<RouterLink to="/e-commerce-platforms" />}
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
                        render={<RouterLink to="/supply-chain-optimization" />}
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
                        render={<RouterLink to="/quality-control" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuItem clicked:",
                            "/quality-control",
                          )
                        }
                      >
                        Quality control
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/production-planning" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuItem clicked:",
                            "/production-planning",
                          )
                        }
                      >
                        Production planning
                      </MegaMenuItem>
                    </MegaMenuItemList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Education</MegaMenuGroupHeading>
                    <MegaMenuItemList>
                      <MegaMenuItem
                        render={
                          <RouterLink to="/learning-management-systems" />
                        }
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
                        render={<RouterLink to="/virtual-classrooms" />}
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
                        render={<RouterLink to="/document-management" />}
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
                        render={<RouterLink to="/citizen-services" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuItem clicked:",
                            "/citizen-services",
                          )
                        }
                      >
                        Citizen services
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/public-safety-solutions" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuItem clicked:",
                            "/public-safety-solutions",
                          )
                        }
                      >
                        Public safety solutions
                      </MegaMenuItem>
                    </MegaMenuItemList>
                  </MegaMenuGroup>
                  <MegaMenuActionBar>
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
                  </MegaMenuActionBar>
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
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Consulting</MegaMenuGroupHeading>
                    <MegaMenuItemList>
                      <MegaMenuItem
                        render={<RouterLink to="/strategy" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/strategy")
                        }
                      >
                        Strategy
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/it" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/it")
                        }
                      >
                        IT
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/hr" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/hr")
                        }
                      >
                        HR
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/marketing" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/marketing")
                        }
                      >
                        Marketing
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/operations" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/operations")
                        }
                      >
                        Operations
                      </MegaMenuItem>
                    </MegaMenuItemList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Implementation</MegaMenuGroupHeading>
                    <MegaMenuItemList>
                      <MegaMenuItem
                        render={<RouterLink to="/onboarding" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/onboarding")
                        }
                      >
                        Onboarding
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/migration" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/migration")
                        }
                      >
                        Migration
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/customization" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/customization")
                        }
                      >
                        Customization
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/training" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/training")
                        }
                      >
                        Training
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/support" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/support")
                        }
                      >
                        Support
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/testing" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/testing")
                        }
                      >
                        Testing
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/rollout" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/rollout")
                        }
                      >
                        Rollout
                      </MegaMenuItem>
                    </MegaMenuItemList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Training</MegaMenuGroupHeading>
                    <MegaMenuItemList>
                      <MegaMenuItem
                        render={<RouterLink to="/online" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/online")
                        }
                      >
                        Online
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/in-person" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/in-person")
                        }
                      >
                        In-person
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/workshops" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/workshops")
                        }
                      >
                        Workshops
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/certifications" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuItem clicked:",
                            "/certifications",
                          )
                        }
                      >
                        Certifications
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/tutorials" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/tutorials")
                        }
                      >
                        Tutorials
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/guides" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/guides")
                        }
                      >
                        Guides
                      </MegaMenuItem>
                    </MegaMenuItemList>
                  </MegaMenuGroup>
                  <MegaMenuActionBar>
                    <Link
                      color="primary"
                      underline="default"
                      href="#link"
                      IconComponent={ChevronRightIcon}
                    >
                      Service status
                    </Link>
                  </MegaMenuActionBar>
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
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Documentation</MegaMenuGroupHeading>
                    <MegaMenuItemList>
                      <MegaMenuItem
                        render={<RouterLink to="/user-guides" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/user-guides")
                        }
                      >
                        User guides
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/api-reference" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/api-reference")
                        }
                      >
                        API reference
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/release-notes" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/release-notes")
                        }
                      >
                        Release notes
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/faqs" />}
                        onClick={() =>
                          console.log("MegaMenuItem clicked:", "/faqs")
                        }
                      >
                        FAQs
                      </MegaMenuItem>
                    </MegaMenuItemList>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Support & help</MegaMenuGroupHeading>
                    <MegaMenuItemList>
                      <MegaMenuItem
                        render={<RouterLink to="/contact-support" />}
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
                        render={<RouterLink to="/community-forum" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuItem clicked:",
                            "/community-forum",
                          )
                        }
                      >
                        Community forum
                      </MegaMenuItem>
                      <MegaMenuItem
                        render={<RouterLink to="/troubleshooting" />}
                        onClick={() =>
                          console.log(
                            "MegaMenuItem clicked:",
                            "/troubleshooting",
                          )
                        }
                      >
                        Troubleshooting
                      </MegaMenuItem>
                    </MegaMenuItemList>
                  </MegaMenuGroup>
                  <MegaMenuActionBar>
                    <Link
                      color="primary"
                      underline="default"
                      href="#link"
                      IconComponent={ChevronRightIcon}
                    >
                      Browse documentation
                    </Link>
                  </MegaMenuActionBar>
                </MegaMenuBody>
              </MegaMenuPanel>
            </MegaMenu>
          </li>
        </StackLayout>
      </nav>
    </MockHistory>
  );
};
