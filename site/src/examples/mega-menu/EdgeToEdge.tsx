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
                      Digital banking
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
                      Risk management
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
                      Patient management
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
                      Telemedicine
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
                      Compliance solutions
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
                      E-commerce platforms
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
                      Supply chain optimization
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
                      Quality control
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
                      Production planning
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
                      Learning management systems
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
                      Virtual classrooms
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
                      Document management
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
                      Citizen services
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
                      Public safety solutions
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
                      Cloud solutions
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
                      Cybersecurity
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
                      Smart Grid Management
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
                      Renewable Integration
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
                      Strategy
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
                      Operations
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
                      Onboarding
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
                      Migration
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
                      Workshops
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
                      User guides
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
                      API reference
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
                      Contact support
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
