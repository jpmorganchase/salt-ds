import { Badge, NavigationItem, StackLayout, Tag } from "@salt-ds/core";
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
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial services</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
                        "Patient management",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Patient management
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    className={styles.menuItemFullWidth}
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
                        "Telemedicine",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                    <div className={styles.menuItemAdornment}>
                      <Tag category={1} variant="primary">
                        Premium
                      </Tag>
                    </div>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
                        "Quality control",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    className={styles.menuItemFullWidth}
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
                        "Production planning",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Production planning
                    </MegaMenuItemContent>
                    <div className={styles.menuItemAdornment}>
                      <Tag category={2} variant="primary">
                        New
                      </Tag>
                    </div>
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Education</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
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
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Consulting</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
                        "IT",
                      );
                    }}
                  >
                    <MegaMenuItemContent>IT</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
                        "HR",
                      );
                    }}
                  >
                    <MegaMenuItemContent>HR</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
                        "Customization",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Customization</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    className={styles.menuItemFullWidth}
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
                        "Training",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Training</MegaMenuItemContent>
                    <div className={styles.menuItemAdornment}>
                      <Badge value="1" />
                    </div>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
                        "Online",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Online</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    className={styles.menuItemFullWidth}
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
                        "In-person",
                      );
                    }}
                  >
                    <MegaMenuItemContent>In-person</MegaMenuItemContent>
                    <div className={styles.menuItemAdornment}>
                      <Badge value="3" />
                    </div>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
                        "Guides",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Guides</MegaMenuItemContent>
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
            <MegaMenuPanel aria-label="Resources menu">
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Documentation</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
                        "API reference",
                      );
                    }}
                  >
                    <MegaMenuItemContent>API reference</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    className={styles.menuItemFullWidth}
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
                        "Release notes",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Release notes</MegaMenuItemContent>
                    <div className={styles.menuItemAdornment}>
                      <Badge />
                    </div>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
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
                        "[WithAdornment MegaMenu] selected value:",
                        "Contact support",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Contact support</MegaMenuItemContent>
                  </MegaMenuItem>
                  <MegaMenuItem
                    className={styles.menuItemFullWidth}
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
                        "Community forum",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Community forum</MegaMenuItemContent>
                    <div className={styles.menuItemAdornment}>
                      <Tag category={2} variant="primary">
                        New
                      </Tag>
                    </div>
                  </MegaMenuItem>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithAdornment MegaMenu] selected value:",
                        "Troubleshooting",
                      );
                    }}
                  >
                    <MegaMenuItemContent>Troubleshooting</MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
      </StackLayout>
    </nav>
  );
};
