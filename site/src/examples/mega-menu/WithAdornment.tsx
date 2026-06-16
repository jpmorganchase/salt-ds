import { Badge, NavigationItem, StackLayout, Tag } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuBody,
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

export const WithAdornment = (): ReactElement => {
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
                          className={styles.menuItemFullWidth}
                          onClick={(event) => {
                            event.preventDefault();
                            console.log(
                              "[WithAdornment MegaMenu] selected value:",
                              "Telemedicine",
                            );
                          }}
                        >
                          Telemedicine
                          <div className={styles.menuItemAdornment}>
                            <Tag category={1} variant="primary">
                              Premium
                            </Tag>
                          </div>
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
                          className={styles.menuItemFullWidth}
                          onClick={(event) => {
                            event.preventDefault();
                            console.log(
                              "[WithAdornment MegaMenu] selected value:",
                              "Production planning",
                            );
                          }}
                        >
                          Production planning
                          <div className={styles.menuItemAdornment}>
                            <Tag category={2} variant="primary">
                              New
                            </Tag>
                          </div>
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
                          className={styles.menuItemFullWidth}
                          onClick={(event) => {
                            event.preventDefault();
                            console.log(
                              "[WithAdornment MegaMenu] selected value:",
                              "Training",
                            );
                          }}
                        >
                          Training
                          <div className={styles.menuItemAdornment}>
                            <Badge value="1" />
                          </div>
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/support" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/support")
                          }
                        >
                          Support
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/testing" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/testing")
                          }
                        >
                          Testing
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          render={<Link to="/rollout" />}
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
                          render={<Link to="/online" />}
                          onClick={() =>
                            console.log("MegaMenuListItem clicked:", "/online")
                          }
                        >
                          Online
                        </MegaMenuListItem>
                        <MegaMenuListItem
                          className={styles.menuItemFullWidth}
                          onClick={(event) => {
                            event.preventDefault();
                            console.log(
                              "[WithAdornment MegaMenu] selected value:",
                              "In-person",
                            );
                          }}
                        >
                          In-person
                          <div className={styles.menuItemAdornment}>
                            <Badge value="3" />
                          </div>
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
                          className={styles.menuItemFullWidth}
                          onClick={(event) => {
                            event.preventDefault();
                            console.log(
                              "[WithAdornment MegaMenu] selected value:",
                              "Release notes",
                            );
                          }}
                        >
                          Release notes
                          <div className={styles.menuItemAdornment}>
                            <Badge />
                          </div>
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
                      <MegaMenuGroupHeading>
                        Support & help
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
                          className={styles.menuItemFullWidth}
                          onClick={(event) => {
                            event.preventDefault();
                            console.log(
                              "[WithAdornment MegaMenu] selected value:",
                              "Community forum",
                            );
                          }}
                        >
                          Community forum
                          <div className={styles.menuItemAdornment}>
                            <Tag category={2} variant="primary">
                              New
                            </Tag>
                          </div>
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
