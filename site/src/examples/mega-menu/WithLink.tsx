import { FlexLayout, Link, NavigationItem, StackLayout } from "@salt-ds/core";
import { ChevronRightIcon } from "@salt-ds/icons";
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
              className={styles.withLinkMenuContainer}
              aria-label="Solutions menu"
            >
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial services</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
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
                        "[WithLink MegaMenu] selected value:",
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
                        "[WithLink MegaMenu] selected value:",
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
                        "[WithLink MegaMenu] selected value:",
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
                        "[WithLink MegaMenu] selected value:",
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
                        "[WithLink MegaMenu] selected value:",
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
                        "[WithLink MegaMenu] selected value:",
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
                        "[WithLink MegaMenu] selected value:",
                        "Quality control",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Production planning",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Production planning
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Education</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
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
                        "[WithLink MegaMenu] selected value:",
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
                        "[WithLink MegaMenu] selected value:",
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
                        "[WithLink MegaMenu] selected value:",
                        "Citizen services",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Citizen services</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Public safety solutions",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Public safety solutions
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <FlexLayout wrap gap={3}>
                <MegaMenuGroup
                  className={styles.linkFooterSpacingFirstLinkStart}
                >
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    Book a demo
                  </Link>
                </MegaMenuGroup>
                <MegaMenuGroup className={styles.linkFooterSpacingMultiLink}>
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    Support center
                  </Link>
                </MegaMenuGroup>
              </FlexLayout>
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
              className={styles.withLinkMenuContainer}
              aria-label="Services menu"
            >
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Consulting</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Strategy",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Strategy</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[WithLink MegaMenu] selected value:", "IT");
                    }}
                  >
                    <MegaMenuItemContent>IT</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log("[WithLink MegaMenu] selected value:", "HR");
                    }}
                  >
                    <MegaMenuItemContent>HR</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Marketing",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Marketing</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
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
                        "[WithLink MegaMenu] selected value:",
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
                        "[WithLink MegaMenu] selected value:",
                        "Migration",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Migration</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Customization",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Customization</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Training",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Training</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Support",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Support</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Testing",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Testing</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Rollout",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Rollout</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Online",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Online</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "In-person",
                      );
                    }}
                  >
                    <MegaMenuItemContent>In-person</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
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
                        "[WithLink MegaMenu] selected value:",
                        "Certifications",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Certifications</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Tutorials",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Tutorials</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Guides",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Guides</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <MegaMenuGroup className={styles.linkFooterSpacing}>
                <Link
                  color="primary"
                  underline="default"
                  href="#link"
                  IconComponent={ChevronRightIcon}
                >
                  Service status
                </Link>
              </MegaMenuGroup>
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
              className={styles.withLinkMenuContainer}
              aria-label="Resources menu"
            >
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Documentation</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
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
                        "[WithLink MegaMenu] selected value:",
                        "API reference",
                      );
                    }}
                  >
                    <MegaMenuItemContent>API reference</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Release notes",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Release notes</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "FAQs",
                      );
                    }}
                  >
                    <MegaMenuItemContent>FAQs</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & help</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
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
                        "[WithLink MegaMenu] selected value:",
                        "Community forum",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Community forum</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithLink MegaMenu] selected value:",
                        "Troubleshooting",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Troubleshooting</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <MegaMenuGroup className={styles.linkFooterSpacing}>
                <Link
                  color="primary"
                  underline="default"
                  href="#link"
                  IconComponent={ChevronRightIcon}
                >
                  Browse documentation
                </Link>
              </MegaMenuGroup>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
      </StackLayout>
    </nav>
  );
};
