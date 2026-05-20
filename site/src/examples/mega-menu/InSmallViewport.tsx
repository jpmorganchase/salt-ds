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
    <div className={styles.smallViewportWrapper}>
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
                className={styles.smallViewportContainer}
                aria-label="Solutions menu"
              >
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Financial services</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
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
                          "[InSmallViewport MegaMenu] selected value:",
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
                          "[InSmallViewport MegaMenu] selected value:",
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
                          "[InSmallViewport MegaMenu] selected value:",
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
                          "[InSmallViewport MegaMenu] selected value:",
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
                          "[InSmallViewport MegaMenu] selected value:",
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
                          "[InSmallViewport MegaMenu] selected value:",
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
                          "[InSmallViewport MegaMenu] selected value:",
                          "Quality control",
                        );
                      }}
                    >
                      Quality control
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Production planning",
                        );
                      }}
                    >
                      Production planning
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Education</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
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
                          "[InSmallViewport MegaMenu] selected value:",
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
                          "[InSmallViewport MegaMenu] selected value:",
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
                          "[InSmallViewport MegaMenu] selected value:",
                          "Citizen services",
                        );
                      }}
                    >
                      Citizen services
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Public safety solutions",
                        );
                      }}
                    >
                      Public safety solutions
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
                className={styles.smallViewportContainer}
                aria-label="Services menu"
              >
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Consulting</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
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
                          "[InSmallViewport MegaMenu] selected value:",
                          "IT",
                        );
                      }}
                    >
                      IT
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "HR",
                        );
                      }}
                    >
                      HR
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Marketing",
                        );
                      }}
                    >
                      Marketing
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
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
                          "[InSmallViewport MegaMenu] selected value:",
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
                          "[InSmallViewport MegaMenu] selected value:",
                          "Migration",
                        );
                      }}
                    >
                      Migration
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Customization",
                        );
                      }}
                    >
                      Customization
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Training",
                        );
                      }}
                    >
                      Training
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Support",
                        );
                      }}
                    >
                      Support
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Training</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Online",
                        );
                      }}
                    >
                      Online
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "In-person",
                        );
                      }}
                    >
                      In-person
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
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
                          "[InSmallViewport MegaMenu] selected value:",
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
                className={styles.smallViewportContainer}
                aria-label="Resources menu"
              >
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Documentation</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
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
                          "[InSmallViewport MegaMenu] selected value:",
                          "API reference",
                        );
                      }}
                    >
                      API reference
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Release notes",
                        );
                      }}
                    >
                      Release notes
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "FAQs",
                        );
                      }}
                    >
                      FAQs
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Support</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
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
                          "[InSmallViewport MegaMenu] selected value:",
                          "Community forum",
                        );
                      }}
                    >
                      Community forum
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Troubleshooting",
                        );
                      }}
                    >
                      Troubleshooting
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Learn</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Tutorials",
                        );
                      }}
                    >
                      Tutorials
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Guides",
                        );
                      }}
                    >
                      Guides
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Best practices",
                        );
                      }}
                    >
                      Best practices
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
