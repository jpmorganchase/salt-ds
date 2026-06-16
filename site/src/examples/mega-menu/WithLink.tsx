import { FlexLayout, Link, NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuBody,
  MegaMenuGroup,
  MegaMenuGroupHeading,
  MegaMenuGroups,
  MegaMenuList,
  MegaMenuListItem,
  MegaMenuPanel,
  MegaMenuSupportingActions,
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
                  <MegaMenuGroups>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>
                        Financial services
                      </MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/digital-banking" />}
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
                          render={<RouterLink to="/risk-management" />}
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
                          render={<RouterLink to="/patient-management" />}
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
                          render={<RouterLink to="/telemedicine" />}
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
                          render={<RouterLink to="/compliance-solutions" />}
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
                          render={<RouterLink to="/e-commerce-platforms" />}
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
                          render={
                            <RouterLink to="/supply-chain-optimization" />
                          }
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
                          render={<RouterLink to="/quality-control" />}
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
                          render={<RouterLink to="/production-planning" />}
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
                          render={
                            <RouterLink to="/learning-management-systems" />
                          }
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
                          render={<RouterLink to="/virtual-classrooms" />}
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
                          render={<RouterLink to="/document-management" />}
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
                          render={<RouterLink to="/citizen-services" />}
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
                          render={<RouterLink to="/public-safety-solutions" />}
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
                  <MegaMenuSupportingActions>
                    <FlexLayout wrap gap={3}>
                      <Link color="primary" underline="default" href="#link">
                        Book a demo
                      </Link>
                      <Link color="primary" underline="default" href="#link">
                        Support center
                      </Link>
                    </FlexLayout>
                  </MegaMenuSupportingActions>
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
                          render={<RouterLink to="/strategy" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/strategy")
                          }
                        >
                          Strategy
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/it" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/it")
                          }
                        >
                          IT
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/hr" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/hr")
                          }
                        >
                          HR
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/marketing" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/marketing")
                          }
                        >
                          Marketing
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/operations" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/operations")
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
                          render={<RouterLink to="/onboarding" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/onboarding")
                          }
                        >
                          Onboarding
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/migration" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/migration")
                          }
                        >
                          Migration
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/customization" />}
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
                          render={<RouterLink to="/training" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/training")
                          }
                        >
                          Training
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/support" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/support")
                          }
                        >
                          Support
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/testing" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/testing")
                          }
                        >
                          Testing
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/rollout" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/rollout")
                          }
                        >
                          Rollout
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Training</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuListItem
                          render={<RouterLink to="/online" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/online")
                          }
                        >
                          Online
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/in-person" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/in-person")
                          }
                        >
                          In-person
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/workshops" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/workshops")
                          }
                        >
                          Workshops
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/certifications" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuListItem clicked:",
                              "/certifications",
                            )
                          }
                        >
                          Certifications
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/tutorials" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/tutorials")
                          }
                        >
                          Tutorials
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/guides" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/guides")
                          }
                        >
                          Guides
                        </MegaMenuListItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                  </MegaMenuGroups>
                  <MegaMenuSupportingActions>
                    <Link color="primary" underline="default" href="#link">
                      Service status
                    </Link>
                  </MegaMenuSupportingActions>
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
                          render={<RouterLink to="/user-guides" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/user-guides")
                          }
                        >
                          User guides
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<RouterLink to="/api-reference" />}
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
                          render={<RouterLink to="/release-notes" />}
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
                          render={<RouterLink to="/faqs" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/faqs")
                          }
                        >
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
                          render={<RouterLink to="/contact-support" />}
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
                          render={<RouterLink to="/community-forum" />}
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
                          render={<RouterLink to="/troubleshooting" />}
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
                  </MegaMenuGroups>
                  <MegaMenuSupportingActions>
                    <Link color="primary" underline="default" href="#link">
                      Browse documentation
                    </Link>
                  </MegaMenuSupportingActions>
                </MegaMenuBody>
              </MegaMenuPanel>
            </MegaMenu>
          </li>
        </StackLayout>
      </nav>
    </MockHistory>
  );
};
