import { Button, StackLayout } from "@salt-ds/core";
import { MenuIcon } from "@salt-ds/icons";
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

export const InSmallViewport = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <nav>
        <StackLayout as="ol" direction="row" gap={1} className={styles.navList}>
          <li>
            <MegaMenu open={isOpen} onOpenChange={setIsOpen}>
              <MegaMenuTrigger>
                <Button sentiment="neutral" appearance="solid">
                  <MenuIcon />
                </Button>
              </MegaMenuTrigger>
              <MegaMenuPanel className={styles.smallViewportContainer}>
                <MegaMenuSection className={styles.smallViewportSection}>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Financial services</MegaMenuHeader>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Digital banking",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
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
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Patient management",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Patient management
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Telemedicine",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Telemedicine</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
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
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
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
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Supply chain optimization",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Supply chain optimization
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Quality control",
                        );
                      }}
                    >
                      <MegaMenuItemContent>Quality control</MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
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
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Learning management systems",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Learning management systems
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
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
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Document management",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Document management
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Citizen services",
                        );
                      }}
                    >
                      <MegaMenuItemContent>
                        Citizen services
                      </MegaMenuItemContent>
                    </MegaMenuItem>
                    <MegaMenuItem
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
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
        </StackLayout>
      </nav>
    </div>
  );
};
