import { Button, StackLayout } from "@salt-ds/core";
import { MenuIcon } from "@salt-ds/icons";
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
import styles from "./index.module.css";

export const InSmallViewport = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    undefined,
  );

  return (
    <div>
      <nav>
        <StackLayout as="ul" direction="row" gap={1} className={styles.navList}>
          <li>
            <MegaMenu
              open={isOpen}
              onOpenChange={setIsOpen}
              selectedItem={selectedItem}
              onSelectedItemChange={(value) => {
                const nextValue = selectedItem === value ? undefined : value;
                setSelectedItem(nextValue);
              }}
            >
              <MegaMenuTrigger>
                <Button
                  onClick={() => setIsOpen((prev) => !prev)}
                  sentiment="neutral"
                  appearance="solid"
                >
                  <MenuIcon />
                </Button>
              </MegaMenuTrigger>
              <MegaMenuContainer className={styles.smallViewportContainer}>
                <MegaMenuSection>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Financial Services</MegaMenuHeader>
                    <MegaMenuItem
                      value="Digital Banking"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Digital Banking",
                        );
                      }}
                    >
                      Digital Banking
                    </MegaMenuItem>
                    <MegaMenuItem
                      value="Risk Management"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Risk Management",
                        );
                      }}
                    >
                      Risk Management
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Healthcare</MegaMenuHeader>
                    <MegaMenuItem
                      value="Patient Management"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Patient Management",
                        );
                      }}
                    >
                      Patient Management
                    </MegaMenuItem>
                    <MegaMenuItem
                      value="Telemedicine"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Telemedicine",
                        );
                      }}
                    >
                      Telemedicine
                    </MegaMenuItem>
                    <MegaMenuItem
                      value="Compliance Solutions"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Compliance Solutions",
                        );
                      }}
                    >
                      Compliance Solutions
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Retail</MegaMenuHeader>
                    <MegaMenuItem
                      value="E-Commerce Platforms"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "E-Commerce Platforms",
                        );
                      }}
                    >
                      E-Commerce Platforms
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Manufacturing</MegaMenuHeader>
                    <MegaMenuItem
                      value="Supply Chain Optimization"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Supply Chain Optimization",
                        );
                      }}
                    >
                      Supply Chain Optimization
                    </MegaMenuItem>
                    <MegaMenuItem
                      value="Quality Control"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Quality Control",
                        );
                      }}
                    >
                      Quality Control
                    </MegaMenuItem>
                    <MegaMenuItem
                      value="Production Planning"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Production Planning",
                        );
                      }}
                    >
                      Production Planning
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Education</MegaMenuHeader>
                    <MegaMenuItem
                      value="Learning Management Systems"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Learning Management Systems",
                        );
                      }}
                    >
                      Learning Management Systems
                    </MegaMenuItem>
                    <MegaMenuItem
                      value="Virtual Classrooms"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Virtual Classrooms",
                        );
                      }}
                    >
                      Virtual Classrooms
                    </MegaMenuItem>
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuHeader>Government</MegaMenuHeader>
                    <MegaMenuItem
                      value="Document Management"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Document Management",
                        );
                      }}
                    >
                      Document Management
                    </MegaMenuItem>
                    <MegaMenuItem
                      value="Citizen Services"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Citizen Services",
                        );
                      }}
                    >
                      Citizen Services
                    </MegaMenuItem>
                    <MegaMenuItem
                      value="Public Safety Solutions"
                      onClick={() => {
                        console.log(
                          "[InSmallViewport MegaMenu] selected value:",
                          "Public Safety Solutions",
                        );
                      }}
                    >
                      Public Safety Solutions
                    </MegaMenuItem>
                  </MegaMenuGroup>
                </MegaMenuSection>
              </MegaMenuContainer>
            </MegaMenu>
          </li>
        </StackLayout>
      </nav>
    </div>
  );
};
