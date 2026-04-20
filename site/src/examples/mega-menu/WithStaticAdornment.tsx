import { Badge, NavigationItem, StackLayout, Tag } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuContainer,
  MegaMenuGroup,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuSection,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";
import styles from "./MegaMenuExamples.module.css";

export const WithStaticAdornment = (): ReactElement => {
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
      <StackLayout as="ul" direction="row" gap={1} className={styles.navList}>
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
              <NavigationItem
                active={activeMenu === "solutions"}
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setOpenMenu((prev) =>
                    prev === "solutions" ? null : "solutions",
                  );
                }}
              >
                Solutions
              </NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuContainer>
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
                  <MegaMenuItem value="Telemedicine">
                    Telemedicine
                    <Tag
                      category={1}
                      variant="primary"
                      className={styles.menuItemAdornment}
                    >
                      Premium
                    </Tag>
                  </MegaMenuItem>
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
                    <Tag
                      category={2}
                      variant="primary"
                      className={styles.menuItemAdornment}
                    >
                      New
                    </Tag>
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
            </MegaMenuContainer>
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
              <NavigationItem
                active={activeMenu === "services"}
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setOpenMenu((prev) =>
                    prev === "services" ? null : "services",
                  );
                }}
              >
                Services
              </NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuContainer>
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
                  <MegaMenuItem value="Training">
                    Training{" "}
                    <Badge value="1" className={styles.menuItemAdornment} />
                  </MegaMenuItem>
                  <MegaMenuItem value="Support">Support</MegaMenuItem>
                  <MegaMenuItem value="Testing">Testing</MegaMenuItem>
                  <MegaMenuItem value="Rollout">Rollout</MegaMenuItem>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuHeader>Training</MegaMenuHeader>
                  <MegaMenuItem value="Online">Online</MegaMenuItem>
                  <MegaMenuItem value="In-Person">
                    In-Person{" "}
                    <Badge value="3" className={styles.menuItemAdornment} />
                  </MegaMenuItem>
                  <MegaMenuItem value="Workshops">Workshops</MegaMenuItem>
                  <MegaMenuItem value="Certifications">
                    Certifications
                  </MegaMenuItem>
                  <MegaMenuItem value="Tutorials">Tutorials</MegaMenuItem>
                  <MegaMenuItem value="Guides">Guides</MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuContainer>
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
              <NavigationItem
                active={activeMenu === "resources"}
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setOpenMenu((prev) =>
                    prev === "resources" ? null : "resources",
                  );
                }}
              >
                Resources
              </NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuContainer>
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Documentation</MegaMenuHeader>
                  <MegaMenuItem value="User Guides">User Guides</MegaMenuItem>
                  <MegaMenuItem value="API Reference">
                    API Reference
                  </MegaMenuItem>
                  <MegaMenuItem value="Release Notes">
                    Release Notes <Badge className={styles.menuItemAdornment} />
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
                    <Tag
                      category={2}
                      variant="primary"
                      className={styles.menuItemAdornment}
                    >
                      New
                    </Tag>
                  </MegaMenuItem>
                  <MegaMenuItem value="Troubleshooting">
                    Troubleshooting
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuContainer>
          </MegaMenu>
        </li>
      </StackLayout>
    </nav>
  );
};
