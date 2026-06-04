import { Badge, NavigationItem, StackLayout, Tag } from "@salt-ds/core";
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
                <MegaMenuMain>
                  <MegaMenuSection>
                    <MegaMenuHeading>Financial services</MegaMenuHeading>
                    <MegaMenuLink
                      render={<Link to="/digital-banking" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/digital-banking")
                      }
                    >
                      Digital banking
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<Link to="/risk-management" />}
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
                        console.log("MegaMenuLink clicked:", "/quality-control")
                      }
                    >
                      Quality control
                    </MegaMenuLink>
                    <MegaMenuLink
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
              <MegaMenuPanel aria-label="Services menu">
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
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<Link to="/support" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/support")
                      }
                    >
                      Support
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<Link to="/testing" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/testing")
                      }
                    >
                      Testing
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<Link to="/rollout" />}
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
                      render={<Link to="/online" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/online")
                      }
                    >
                      Online
                    </MegaMenuLink>
                    <MegaMenuLink
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
                        console.log("MegaMenuLink clicked:", "/certifications")
                      }
                    >
                      Certifications
                    </MegaMenuLink>
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
              <MegaMenuPanel aria-label="Resources menu">
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
                    <MegaMenuHeading>Support & help</MegaMenuHeading>
                    <MegaMenuLink
                      render={<Link to="/contact-support" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/contact-support")
                      }
                    >
                      Contact support
                    </MegaMenuLink>
                    <MegaMenuLink
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
                    </MegaMenuLink>
                    <MegaMenuLink
                      render={<Link to="/troubleshooting" />}
                      onClick={() =>
                        console.log("MegaMenuLink clicked:", "/troubleshooting")
                      }
                    >
                      Troubleshooting
                    </MegaMenuLink>
                  </MegaMenuSection>
                </MegaMenuMain>
              </MegaMenuPanel>
            </MegaMenu>
          </li>
        </StackLayout>
      </nav>
    </MockHistory>
  );
};
