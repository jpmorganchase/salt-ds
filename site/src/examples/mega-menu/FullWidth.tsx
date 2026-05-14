import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuGroup,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuItemContent,
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
                      <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
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
                      <MegaMenuItemContent>Risk management</MegaMenuItemContent>
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
                      <MegaMenuItemContent>
                        Patient management
                      </MegaMenuItemContent>
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
                      <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
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
                      <MegaMenuItemContent>
                        Compliance solutions
                      </MegaMenuItemContent>
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
                      <MegaMenuItemContent>
                        E-commerce platforms
                      </MegaMenuItemContent>
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
                      <MegaMenuItemContent>
                        Supply chain optimization
                      </MegaMenuItemContent>
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
                      <MegaMenuItemContent>Quality control</MegaMenuItemContent>
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
                      <MegaMenuItemContent>
                        Learning management systems
                      </MegaMenuItemContent>
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
                      <MegaMenuItemContent>
                        Virtual classrooms
                      </MegaMenuItemContent>
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
                      <MegaMenuItemContent>
                        Document management
                      </MegaMenuItemContent>
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
                      <MegaMenuItemContent>
                        Citizen services
                      </MegaMenuItemContent>
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
                      <MegaMenuItemContent>Cloud solutions</MegaMenuItemContent>
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
                      <MegaMenuItemContent>Cybersecurity</MegaMenuItemContent>
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
                      <MegaMenuItemContent>Strategy</MegaMenuItemContent>
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
                      <MegaMenuItemContent>Operations</MegaMenuItemContent>
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
                      <MegaMenuItemContent>Onboarding</MegaMenuItemContent>
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
                      <MegaMenuItemContent>Migration</MegaMenuItemContent>
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
                      <MegaMenuItemContent>Workshops</MegaMenuItemContent>
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
                      <MegaMenuItemContent>Certifications</MegaMenuItemContent>
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
                      <MegaMenuItemContent>User guides</MegaMenuItemContent>
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
                      <MegaMenuItemContent>API reference</MegaMenuItemContent>
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
                      <MegaMenuItemContent>Contact support</MegaMenuItemContent>
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
                      <MegaMenuItemContent>Community forum</MegaMenuItemContent>
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
