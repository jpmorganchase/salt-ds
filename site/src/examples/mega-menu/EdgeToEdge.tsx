import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  CallIcon,
  CartIcon,
  DatasetManagerIcon,
  DevicesIcon,
  DocumentIcon,
  GuideOpenIcon,
  LaptopIcon,
  LinkedIcon,
  NotificationIcon,
  PasteIcon,
  PinIcon,
  SettingsIcon,
  UserGroupIcon,
  UserSearchIcon,
} from "@salt-ds/icons";
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

export const EdgeToEdge = (): ReactElement => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleOpenChange = (menu: string) => (open: boolean) => {
    setOpenMenu(open ? menu : null);
    if (open) {
      setActiveMenu(menu);
    }
  };

  return (
    <div className={styles.edgeToEdgeWrapper}>
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
                className={styles.edgeToEdgePanel}
              >
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Financial services</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[EdgeToEdge MegaMenu] selected value:",
                          "Digital banking",
                        );
                      }}
                    >
                      <DevicesIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[EdgeToEdge MegaMenu] selected value:",
                          "Risk management",
                        );
                      }}
                    >
                      <DatasetManagerIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>Risk management</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Healthcare</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[EdgeToEdge MegaMenu] selected value:",
                          "Patient management",
                        );
                      }}
                    >
                      <UserSearchIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>
                        Patient management
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[EdgeToEdge MegaMenu] selected value:",
                          "Telemedicine",
                        );
                      }}
                    >
                      <CallIcon aria-hidden className="saltMegaMenuItem-icon" />
                      <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[EdgeToEdge MegaMenu] selected value:",
                          "Compliance solutions",
                        );
                      }}
                    >
                      <PasteIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
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
                          "[EdgeToEdge MegaMenu] selected value:",
                          "E-commerce platforms",
                        );
                      }}
                    >
                      <CartIcon aria-hidden className="saltMegaMenuItem-icon" />
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
                          "[EdgeToEdge MegaMenu] selected value:",
                          "Supply chain optimization",
                        );
                      }}
                    >
                      <LinkedIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>
                        Supply chain optimization
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[EdgeToEdge MegaMenu] selected value:",
                          "Quality control",
                        );
                      }}
                    >
                      <SettingsIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[EdgeToEdge MegaMenu] selected value:",
                          "Production planning",
                        );
                      }}
                    >
                      <NotificationIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
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
                          "[EdgeToEdge MegaMenu] selected value:",
                          "Learning management systems",
                        );
                      }}
                    >
                      <GuideOpenIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>
                        Learning management systems
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[EdgeToEdge MegaMenu] selected value:",
                          "Virtual classrooms",
                        );
                      }}
                    >
                      <LaptopIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
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
                          "[EdgeToEdge MegaMenu] selected value:",
                          "Document management",
                        );
                      }}
                    >
                      <DocumentIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>
                        Document management
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[EdgeToEdge MegaMenu] selected value:",
                          "Citizen services",
                        );
                      }}
                    >
                      <PinIcon aria-hidden className="saltMegaMenuItem-icon" />
                      <MegaMenuItemContent>
                        Citizen services
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[EdgeToEdge MegaMenu] selected value:",
                          "Public safety solutions",
                        );
                      }}
                    >
                      <UserGroupIcon
                        aria-hidden
                        className="saltMegaMenuItem-icon"
                      />
                      <MegaMenuItemContent>
                        Public safety solutions
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Technology</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[EdgeToEdge MegaMenu] selected value:",
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
                          "[EdgeToEdge MegaMenu] selected value:",
                          "Cybersecurity",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Cybersecurity</MegaMenuItemContent>
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Energy</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[EdgeToEdge MegaMenu] selected value:",
                          "Smart Grid Management",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Smart Grid Management
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[EdgeToEdge MegaMenu] selected value:",
                          "Renewable Integration",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Renewable Integration
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
              <MegaMenuPanel
                aria-label="Services menu"
                className={styles.edgeToEdgePanel}
              >
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Consulting</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[EdgeToEdge MegaMenu] selected value:",
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
                          "[EdgeToEdge MegaMenu] selected value:",
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
                          "[EdgeToEdge MegaMenu] selected value:",
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
                          "[EdgeToEdge MegaMenu] selected value:",
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
                          "[EdgeToEdge MegaMenu] selected value:",
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
                          "[EdgeToEdge MegaMenu] selected value:",
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
                className={styles.edgeToEdgePanel}
              >
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Documentation</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={(event) => {
                        event.preventDefault();
                        console.log(
                          "[EdgeToEdge MegaMenu] selected value:",
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
                          "[EdgeToEdge MegaMenu] selected value:",
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
                          "[EdgeToEdge MegaMenu] selected value:",
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
                          "[EdgeToEdge MegaMenu] selected value:",
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
