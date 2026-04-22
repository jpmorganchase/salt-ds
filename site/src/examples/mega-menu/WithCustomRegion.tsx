import { Button, FlexLayout, Link, StackLayout, Text } from "@salt-ds/core";
import { ChevronRightIcon } from "@salt-ds/icons";
import {
  MegaMenu,
  MegaMenuContainer,
  MegaMenuCustomRegion,
  MegaMenuGroup,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuLinkRow,
  MegaMenuSection,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";
import styles from "./index.module.css";

const exampleImage = "/img/examples/image-skeleton.png";
const exampleImage2 = "/img/examples/image-skeleton2.png";

export const WithCustomRegion = (): ReactElement => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <StackLayout direction="column" gap={2}>
      <MegaMenu
        open={openMenu === "right"}
        onOpenChange={(open) => setOpenMenu(open ? "right" : null)}
      >
        <div className={styles.customRegionWrapper}>
          <MegaMenuTrigger>
            <Button
              onClick={() =>
                setOpenMenu((prev) => (prev === "right" ? null : "right"))
              }
            >
              Custom Region on Right
            </Button>
          </MegaMenuTrigger>
          <MegaMenuContainer className={styles.customRegionNoContainerPadding}>
            <div className={styles.customRegionContent}>
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
              </MegaMenuSection>
              <MegaMenuLinkRow>
                <Link href="#">Explore details</Link>
              </MegaMenuLinkRow>
            </div>
            <MegaMenuCustomRegion
              variant="tertiary"
              style={{ width: "fit-content" }}
            >
              <FlexLayout direction="column" gap={2}>
                <img
                  alt="Featured resource"
                  src={exampleImage}
                  className={styles.customRegionImage}
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0}>
                    <Text styleAs="h2">Featured Resource</Text>
                    <Text className={styles.customRegionRightDescription}>
                      Explore our latest accessibility guidelines to ensure your
                      components meet ADA standards and provide an inclusive
                      user experience.
                    </Text>
                  </StackLayout>
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    View Guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuCustomRegion>
          </MegaMenuContainer>
        </div>
      </MegaMenu>

      <MegaMenu
        open={openMenu === "left"}
        onOpenChange={(open) => setOpenMenu(open ? "left" : null)}
      >
        <div className={styles.customRegionWrapper}>
          <MegaMenuTrigger>
            <Button
              onClick={() =>
                setOpenMenu((prev) => (prev === "left" ? null : "left"))
              }
            >
              Custom Region on Left
            </Button>
          </MegaMenuTrigger>

          <MegaMenuContainer className={styles.customRegionNoContainerPadding}>
            <MegaMenuCustomRegion variant="secondary">
              <FlexLayout direction="column" gap={2}>
                <img
                  alt="Featured resource"
                  src={exampleImage}
                  className={styles.customRegionImage}
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0}>
                    <Text styleAs="h2">Featured Resource</Text>
                    <Text className={styles.customRegionRightDescription}>
                      Explore our latest accessibility guidelines to ensure your
                      components meet ADA standards and provide an inclusive
                      user experience.
                    </Text>
                  </StackLayout>
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    View Guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuCustomRegion>
            <div className={styles.customRegionContent}>
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
              </MegaMenuSection>
              <MegaMenuLinkRow>
                <Link href="#">Explore details</Link>
              </MegaMenuLinkRow>
            </div>
          </MegaMenuContainer>
        </div>
      </MegaMenu>

      <MegaMenu
        open={openMenu === "top"}
        onOpenChange={(open) => setOpenMenu(open ? "top" : null)}
      >
        <div className={styles.customRegionWrapper}>
          <MegaMenuTrigger>
            <Button
              onClick={() =>
                setOpenMenu((prev) => (prev === "top" ? null : "top"))
              }
            >
              Custom Region on Top
            </Button>
          </MegaMenuTrigger>

          <MegaMenuContainer
            className={styles.customRegionNoContainerPadding}
            style={{ flexDirection: "column" }}
          >
            <MegaMenuCustomRegion variant="primary">
              <FlexLayout direction="column" gap={2}>
                <img
                  alt="Featured resource"
                  src={exampleImage2}
                  className={styles.customRegionImage}
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0}>
                    <Text styleAs="h2">Featured Resource</Text>
                    <Text>
                      Explore our latest accessibility guidelines to ensure your
                      components meet ADA standards and provide an inclusive
                      user experience.
                    </Text>
                  </StackLayout>
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    View Guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuCustomRegion>
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
            </MegaMenuSection>
            <MegaMenuLinkRow>
              <Link href="#">Explore details</Link>
            </MegaMenuLinkRow>
          </MegaMenuContainer>
        </div>
      </MegaMenu>

      <MegaMenu
        open={openMenu === "bottom"}
        onOpenChange={(open) => setOpenMenu(open ? "bottom" : null)}
      >
        <div className={styles.customRegionWrapper}>
          <MegaMenuTrigger>
            <Button
              onClick={() =>
                setOpenMenu((prev) => (prev === "bottom" ? null : "bottom"))
              }
            >
              Custom Region on Bottom
            </Button>
          </MegaMenuTrigger>

          <MegaMenuContainer
            className={styles.customRegionNoContainerPadding}
            style={{ flexDirection: "column" }}
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
            </MegaMenuSection>
            <MegaMenuLinkRow>
              <Link href="#">Explore details</Link>
            </MegaMenuLinkRow>
            <MegaMenuCustomRegion variant="tertiary">
              <FlexLayout direction="column" gap={2}>
                <img
                  alt="Featured resource"
                  src={exampleImage2}
                  className={styles.customRegionImage}
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0}>
                    <Text styleAs="h2">Featured Resource</Text>
                    <Text>
                      Explore our latest accessibility guidelines to ensure your
                      components meet ADA standards and provide an inclusive
                      user experience.
                    </Text>
                  </StackLayout>
                  <Link
                    color="primary"
                    underline="default"
                    href="#link"
                    IconComponent={ChevronRightIcon}
                  >
                    View Guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuCustomRegion>
          </MegaMenuContainer>
        </div>
      </MegaMenu>
    </StackLayout>
  );
};
