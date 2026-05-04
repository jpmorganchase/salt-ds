import { Link, NavigationItem, StackLayout } from "@salt-ds/core";
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

export const WithLink = (): ReactElement => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | undefined>();

  const handleOpenChange = (menu: string) => (open: boolean) => {
    setOpenMenu(open ? menu : null);
  };

  const handleSelectedItemChange = (
    menu: string,
    value: string | undefined,
  ) => {
    const nextValue = selectedItem === value ? undefined : value;
    setSelectedItem(nextValue);
    setActiveMenu(nextValue ? menu : null);
  };

  return (
    <nav>
      <StackLayout as="ol" direction="row" gap={1} className={styles.navList}>
        <li>
          <MegaMenu
            open={openMenu === "solutions"}
            onOpenChange={handleOpenChange("solutions")}
            selectedItem={selectedItem}
            onSelectedItemChange={(value) =>
              handleSelectedItemChange("solutions", value)
            }
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
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem value="Digital Banking">
                    Digital Banking
                  </MegaMenuItem>
                  <MegaMenuItem value="Risk Management">
                    Risk Management
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Healthcare</MegaMenuHeader>
                  <MegaMenuItem value="Patient Management">
                    Patient Management
                  </MegaMenuItem>
                  <MegaMenuItem value="Telemedicine">Telemedicine</MegaMenuItem>
                  <MegaMenuItem value="Compliance Solutions">
                    Compliance Solutions
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Retail</MegaMenuHeader>
                  <MegaMenuItem value="E-Commerce Platforms">
                    E-Commerce Platforms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                  <MegaMenuItem value="Supply Chain Optimization">
                    Supply Chain Optimization
                  </MegaMenuItem>
                  <MegaMenuItem value="Quality Control">
                    Quality Control
                  </MegaMenuItem>
                  <MegaMenuItem value="Production Planning">
                    Production Planning
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Education</MegaMenuHeader>
                  <MegaMenuItem value="Learning Management Systems">
                    Learning Management Systems
                  </MegaMenuItem>
                  <MegaMenuItem value="Virtual Classrooms">
                    Virtual Classrooms
                  </MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Government</MegaMenuHeader>
                  <MegaMenuItem value="Document Management">
                    Document Management
                  </MegaMenuItem>
                  <MegaMenuItem value="Citizen Services">
                    Citizen Services
                  </MegaMenuItem>
                  <MegaMenuItem value="Public Safety Solutions">
                    Public Safety Solutions
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <MegaMenuSection>
                <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  <MegaMenuItem>
                    <Link>See all solutions</Link>
                  </MegaMenuItem>
                </ol>
              </MegaMenuSection>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu
            open={openMenu === "services"}
            onOpenChange={handleOpenChange("services")}
            selectedItem={selectedItem}
            onSelectedItemChange={(value) =>
              handleSelectedItemChange("services", value)
            }
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
                  <MegaMenuItem value="Strategy">Strategy</MegaMenuItem>
                  <MegaMenuItem value="IT">IT</MegaMenuItem>
                  <MegaMenuItem value="HR">HR</MegaMenuItem>
                  <MegaMenuItem value="Marketing">Marketing</MegaMenuItem>
                  <MegaMenuItem value="Operations">Operations</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Implementation</MegaMenuHeader>
                  <MegaMenuItem value="Onboarding">Onboarding</MegaMenuItem>
                  <MegaMenuItem value="Migration">Migration</MegaMenuItem>
                  <MegaMenuItem value="Customization">
                    Customization
                  </MegaMenuItem>
                  <MegaMenuItem value="Training">Training</MegaMenuItem>
                  <MegaMenuItem value="Support">Support</MegaMenuItem>
                  <MegaMenuItem value="Testing">Testing</MegaMenuItem>
                  <MegaMenuItem value="Rollout">Rollout</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem value="Online">Online</MegaMenuItem>
                  <MegaMenuItem value="In-Person">In-Person</MegaMenuItem>
                  <MegaMenuItem value="Workshops">Workshops</MegaMenuItem>
                  <MegaMenuItem value="Certifications">
                    Certifications
                  </MegaMenuItem>
                  <MegaMenuItem value="Tutorials">Tutorials</MegaMenuItem>
                  <MegaMenuItem value="Guides">Guides</MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <MegaMenuSection>
                <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  <MegaMenuItem>
                    <Link>See all services</Link>
                  </MegaMenuItem>
                </ol>
              </MegaMenuSection>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu
            open={openMenu === "resources"}
            onOpenChange={handleOpenChange("resources")}
            selectedItem={selectedItem}
            onSelectedItemChange={(value) =>
              handleSelectedItemChange("resources", value)
            }
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
                  <MegaMenuItem value="User Guides">User Guides</MegaMenuItem>
                  <MegaMenuItem value="API Reference">
                    API Reference
                  </MegaMenuItem>
                  <MegaMenuItem value="Release Notes">
                    Release Notes
                  </MegaMenuItem>
                  <MegaMenuItem value="FAQs">FAQs</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Support & Help</MegaMenuHeader>
                  <MegaMenuItem value="Contact Support">
                    Contact Support
                  </MegaMenuItem>
                  <MegaMenuItem value="Community Forum">
                    Community Forum
                  </MegaMenuItem>
                  <MegaMenuItem value="Troubleshooting">
                    Troubleshooting
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <MegaMenuSection>
                <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  <MegaMenuItem>
                    <Link>See all resources</Link>
                  </MegaMenuItem>
                </ol>
              </MegaMenuSection>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
      </StackLayout>
    </nav>
  );
};
