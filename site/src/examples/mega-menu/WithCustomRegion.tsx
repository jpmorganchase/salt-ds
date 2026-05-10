import { Button, FlexLayout, Link, StackLayout, Text } from "@salt-ds/core";
import { ChevronRightIcon } from "@salt-ds/icons";
import {
  MegaMenu,
  MegaMenuCustomRegion,
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
            <Button>Custom Region on Right</Button>
          </MegaMenuTrigger>
          <MegaMenuPanel className={styles.customRegionNoContainerPadding}>
            <div className={styles.customRegionContent}>
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial services</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithCustomRegion MegaMenu] selected value:",
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
                        "[WithCustomRegion MegaMenu] selected value:",
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
                        "[WithCustomRegion MegaMenu] selected value:",
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
                        "[WithCustomRegion MegaMenu] selected value:",
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
                        "[WithCustomRegion MegaMenu] selected value:",
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
                        "[WithCustomRegion MegaMenu] selected value:",
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
                        "[WithCustomRegion MegaMenu] selected value:",
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
                        "[WithCustomRegion MegaMenu] selected value:",
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
                        "[WithCustomRegion MegaMenu] selected value:",
                        "Production planning",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Production planning
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <MegaMenuGroup
                style={{
                  padding:
                    " 0 var(--salt-spacing-300)  var(--salt-spacing-300)",
                  width: "fit-content",
                }}
              >
                <Link
                  color="primary"
                  underline="default"
                  href="#link"
                  IconComponent={ChevronRightIcon}
                >
                  View guidelines
                </Link>
              </MegaMenuGroup>
            </div>
            <MegaMenuCustomRegion
              className={styles.customRegionTertiary}
              style={{ width: "fit-content" }}
            >
              <FlexLayout direction={"column"} wrap gap={2}>
                <img
                  alt="Featured resource"
                  src={exampleImage}
                  className={styles.customRegionImage}
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0}>
                    <Text styleAs="h2" as="h2">
                      Featured Resource
                    </Text>
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
                    View guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuCustomRegion>
          </MegaMenuPanel>
        </div>
      </MegaMenu>

      <MegaMenu
        open={openMenu === "left"}
        onOpenChange={(open) => setOpenMenu(open ? "left" : null)}
      >
        <div className={styles.customRegionWrapper}>
          <MegaMenuTrigger>
            <Button>Custom Region on Left</Button>
          </MegaMenuTrigger>

          <MegaMenuPanel className={styles.customRegionNoContainerPadding}>
            <MegaMenuCustomRegion className={styles.customRegionSecondary}>
              <FlexLayout direction={"column"} wrap gap={2}>
                <img
                  alt="Featured resource"
                  src={exampleImage}
                  className={styles.customRegionImage}
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0}>
                    <Text styleAs="h2" as="h2">
                      Featured Resource
                    </Text>
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
                    View guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuCustomRegion>
            <div className={styles.customRegionContent}>
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial services</MegaMenuHeader>
                  <MegaMenuItem
                    onClick={(event) => {
                      event.preventDefault();
                      console.log(
                        "[WithCustomRegion MegaMenu] selected value:",
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
                        "[WithCustomRegion MegaMenu] selected value:",
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
                        "[WithCustomRegion MegaMenu] selected value:",
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
                        "[WithCustomRegion MegaMenu] selected value:",
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
                        "[WithCustomRegion MegaMenu] selected value:",
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
                        "[WithCustomRegion MegaMenu] selected value:",
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
                        "[WithCustomRegion MegaMenu] selected value:",
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
                        "[WithCustomRegion MegaMenu] selected value:",
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
                        "[WithCustomRegion MegaMenu] selected value:",
                        "Production planning",
                      );
                    }}
                  >
                    <MegaMenuItemContent>
                      Production planning
                    </MegaMenuItemContent>
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
              <MegaMenuGroup
                style={{
                  padding:
                    " 0 var(--salt-spacing-300)  var(--salt-spacing-300)",
                  width: "fit-content",
                }}
              >
                <Link
                  color="primary"
                  underline="default"
                  href="#link"
                  IconComponent={ChevronRightIcon}
                >
                  View guidelines
                </Link>
              </MegaMenuGroup>
            </div>
          </MegaMenuPanel>
        </div>
      </MegaMenu>

      <MegaMenu
        open={openMenu === "top"}
        onOpenChange={(open) => setOpenMenu(open ? "top" : null)}
      >
        <div className={styles.customRegionWrapper}>
          <MegaMenuTrigger>
            <Button>Custom Region on Top</Button>
          </MegaMenuTrigger>

          <MegaMenuPanel
            className={styles.customRegionNoContainerPadding}
            style={{ flexDirection: "column" }}
          >
            <MegaMenuCustomRegion className={styles.customRegionPrimary}>
              <FlexLayout direction={"column"} wrap gap={2}>
                <img
                  alt="Featured resource"
                  src={exampleImage2}
                  className={styles.customRegionImage}
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0}>
                    <Text styleAs="h2" as="h2">
                      Featured Resource
                    </Text>
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
                    View guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuCustomRegion>
            <MegaMenuSection>
              <MegaMenuGroup>
                <MegaMenuHeader>Financial services</MegaMenuHeader>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[WithCustomRegion MegaMenu] selected value:",
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
                      "[WithCustomRegion MegaMenu] selected value:",
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
                      "[WithCustomRegion MegaMenu] selected value:",
                      "Patient management",
                    );
                  }}
                >
                  <MegaMenuItemContent>Patient management</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[WithCustomRegion MegaMenu] selected value:",
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
                      "[WithCustomRegion MegaMenu] selected value:",
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
                      "[WithCustomRegion MegaMenu] selected value:",
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
                      "[WithCustomRegion MegaMenu] selected value:",
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
                      "[WithCustomRegion MegaMenu] selected value:",
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
                      "[WithCustomRegion MegaMenu] selected value:",
                      "Production planning",
                    );
                  }}
                >
                  <MegaMenuItemContent>Production planning</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuSection>
            <MegaMenuGroup
              style={{
                padding: " 0 var(--salt-spacing-300)  var(--salt-spacing-300)",
                width: "fit-content",
              }}
            >
              <Link
                color="primary"
                underline="default"
                href="#link"
                IconComponent={ChevronRightIcon}
              >
                View guidelines
              </Link>
            </MegaMenuGroup>
          </MegaMenuPanel>
        </div>
      </MegaMenu>

      <MegaMenu
        open={openMenu === "bottom"}
        onOpenChange={(open) => setOpenMenu(open ? "bottom" : null)}
      >
        <div className={styles.customRegionWrapper}>
          <MegaMenuTrigger>
            <Button>Custom Region on Bottom</Button>
          </MegaMenuTrigger>

          <MegaMenuPanel
            className={styles.customRegionNoContainerPadding}
            style={{ flexDirection: "column" }}
          >
            <MegaMenuSection>
              <MegaMenuGroup>
                <MegaMenuHeader>Financial services</MegaMenuHeader>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[WithCustomRegion MegaMenu] selected value:",
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
                      "[WithCustomRegion MegaMenu] selected value:",
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
                      "[WithCustomRegion MegaMenu] selected value:",
                      "Patient management",
                    );
                  }}
                >
                  <MegaMenuItemContent>Patient management</MegaMenuItemContent>
                </MegaMenuItem>
                <MegaMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    console.log(
                      "[WithCustomRegion MegaMenu] selected value:",
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
                      "[WithCustomRegion MegaMenu] selected value:",
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
                      "[WithCustomRegion MegaMenu] selected value:",
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
                      "[WithCustomRegion MegaMenu] selected value:",
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
                      "[WithCustomRegion MegaMenu] selected value:",
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
                      "[WithCustomRegion MegaMenu] selected value:",
                      "Production planning",
                    );
                  }}
                >
                  <MegaMenuItemContent>Production planning</MegaMenuItemContent>
                </MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuSection>
            <MegaMenuGroup
              style={{
                padding: " 0 var(--salt-spacing-300)  var(--salt-spacing-300)",
                width: "fit-content",
              }}
            >
              <Link
                color="primary"
                underline="default"
                href="#link"
                IconComponent={ChevronRightIcon}
              >
                View guidelines
              </Link>
            </MegaMenuGroup>
            <MegaMenuCustomRegion className={styles.customRegionTertiary}>
              <FlexLayout direction={"column"} wrap gap={2}>
                <img
                  alt="Featured resource"
                  src={exampleImage2}
                  className={styles.customRegionImage}
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0}>
                    <Text styleAs="h2" as="h2">
                      Featured Resource
                    </Text>
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
                    View guidelines
                  </Link>
                </StackLayout>
              </FlexLayout>
            </MegaMenuCustomRegion>
          </MegaMenuPanel>
        </div>
      </MegaMenu>
    </StackLayout>
  );
};
