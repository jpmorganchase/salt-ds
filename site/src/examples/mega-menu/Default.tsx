import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuBody,
  MegaMenuGroup,
  MegaMenuGroupHeading,
  MegaMenuGroups,
  MegaMenuItem,
  MegaMenuList,
  MegaMenuPanel,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";
import { Link } from "react-router";
import styles from "./index.module.css";
import { MockHistory } from "./MockHistory";

export const Default = (): ReactElement => {
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
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
                      <MegaMenuList>
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
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Retail</MegaMenuGroupHeading>
                      <MegaMenuList>
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
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Manufacturing</MegaMenuGroupHeading>
                      <MegaMenuList>
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
                        <MegaMenuItem
                          render={<Link to="/production-planning" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/production-planning",
                            )
                          }
                        >
                          Production planning
                        </MegaMenuItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Education</MegaMenuGroupHeading>
                      <MegaMenuList>
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
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Government</MegaMenuGroupHeading>
                      <MegaMenuList>
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
                        <MegaMenuItem
                          render={<Link to="/public-safety-solutions" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/public-safety-solutions",
                            )
                          }
                        >
                          Public safety solutions
                        </MegaMenuItem>
                      </MegaMenuList>
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
              <MegaMenuPanel aria-label="Services menu">
                <MegaMenuBody>
                  <MegaMenuGroups>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Consulting</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuItem
                          render={<Link to="/strategy" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/strategy")
                          }
                        >
                          Strategy
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/it" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/it")
                          }
                        >
                          IT
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/hr" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/hr")
                          }
                        >
                          HR
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/marketing" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/marketing")
                          }
                        >
                          Marketing
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/operations" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/operations")
                          }
                        >
                          Operations
                        </MegaMenuItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>
                        Implementation
                      </MegaMenuGroupHeading>
                      <MegaMenuList>
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
                        <MegaMenuItem
                          render={<Link to="/customization" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/customization",
                            )
                          }
                        >
                          Customization
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/training" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/training")
                          }
                        >
                          Training
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/support" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/support")
                          }
                        >
                          Support
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/testing" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/testing")
                          }
                        >
                          Testing
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/rollout" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/rollout")
                          }
                        >
                          Rollout
                        </MegaMenuItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Training</MegaMenuGroupHeading>
                      <MegaMenuList>
                        <MegaMenuItem
                          render={<Link to="/online" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/online")
                          }
                        >
                          Online
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/in-person" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/in-person")
                          }
                        >
                          In-person
                        </MegaMenuItem>
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
                        <MegaMenuItem
                          render={<Link to="/tutorials" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/tutorials")
                          }
                        >
                          Tutorials
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/guides" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/guides")
                          }
                        >
                          Guides
                        </MegaMenuItem>
                      </MegaMenuList>
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
              <MegaMenuPanel aria-label="Resources menu">
                <MegaMenuBody>
                  <MegaMenuGroups>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>Documentation</MegaMenuGroupHeading>
                      <MegaMenuList>
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
                        <MegaMenuItem
                          render={<Link to="/release-notes" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/release-notes",
                            )
                          }
                        >
                          Release notes
                        </MegaMenuItem>
                        <MegaMenuItem
                          render={<Link to="/faqs" />}
                          onClick={() =>
                            console.log("MegaMenuItem clicked:", "/faqs")
                          }
                        >
                          FAQs
                        </MegaMenuItem>
                      </MegaMenuList>
                    </MegaMenuGroup>
                    <MegaMenuGroup>
                      <MegaMenuGroupHeading>
                        Support & help
                      </MegaMenuGroupHeading>
                      <MegaMenuList>
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
                        <MegaMenuItem
                          render={<Link to="/troubleshooting" />}
                          onClick={() =>
                            console.log(
                              "MegaMenuItem clicked:",
                              "/troubleshooting",
                            )
                          }
                        >
                          Troubleshooting
                        </MegaMenuItem>
                      </MegaMenuList>
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
