import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuGroup,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuPanel,
  MegaMenuSection,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";
import styles from "./index.module.css";

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
    <div className={styles.fullWidthWrapper}>
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
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Financial services</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Digital banking",
                        );
                      }}
                    >
                      Digital banking
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Risk management",
                        );
                      }}
                    >
                      Risk management
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Healthcare</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Patient management",
                        );
                      }}
                    >
                      Patient management
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Telemedicine",
                        );
                      }}
                    >
                      Telemedicine
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Compliance solutions",
                        );
                      }}
                    >
                      Compliance solutions
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Retail</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "E-commerce platforms",
                        );
                      }}
                    >
                      E-commerce platforms
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Supply chain optimization",
                        );
                      }}
                    >
                      Supply chain optimization
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Quality control",
                        );
                      }}
                    >
                      Quality control
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Education</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Learning management systems",
                        );
                      }}
                    >
                      Learning management systems
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Virtual classrooms",
                        );
                      }}
                    >
                      Virtual classrooms
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Government</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Document management",
                        );
                      }}
                    >
                      Document management
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Citizen services",
                        );
                      }}
                    >
                      Citizen services
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Technology</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Cloud solutions",
                        );
                      }}
                    >
                      Cloud solutions
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Cybersecurity",
                        );
                      }}
                    >
                      Cybersecurity
                    </MegaMenuItem>
                  </MegaMenuGroup>
                </MegaMenuSection>
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
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Consulting</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Strategy",
                        );
                      }}
                    >
                      Strategy
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Operations",
                        );
                      }}
                    >
                      Operations
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Implementation</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Onboarding",
                        );
                      }}
                    >
                      Onboarding
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Migration",
                        );
                      }}
                    >
                      Migration
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Training</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Workshops",
                        );
                      }}
                    >
                      Workshops
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Certifications",
                        );
                      }}
                    >
                      Certifications
                    </MegaMenuItem>
                  </MegaMenuGroup>
                </MegaMenuSection>
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
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Documentation</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "User guides",
                        );
                      }}
                    >
                      User guides
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "API reference",
                        );
                      }}
                    >
                      API reference
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Support &amp; help</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Contact support",
                        );
                      }}
                    >
                      Contact support
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[FullWidth MegaMenu] selected value:",
                          "Community forum",
                        );
                      }}
                    >
                      Community forum
                    </MegaMenuItem>
                  </MegaMenuGroup>
                </MegaMenuSection>
              </MegaMenuPanel>
            </MegaMenu>
          </li>
        </StackLayout>
      </nav>
    </div>
  );
};
