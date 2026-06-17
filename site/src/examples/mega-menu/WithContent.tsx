import { Button, FlexLayout, Link, StackLayout, Text } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuBody,
  MegaMenuGroup,
  MegaMenuGroupHeading,
  MegaMenuGroups,
  MegaMenuList,
  MegaMenuListItem,
  MegaMenuPanel,
  MegaMenuSupportingActions,
  MegaMenuSupportingContent,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import Image from "next/image";
import { type ReactElement, useState } from "react";
import { Link as RouterLink } from "react-router";
import styles from "./index.module.css";
import { MockHistory } from "./MockHistory";

const exampleImage = "/img/examples/image-skeleton.png";

const featuredResource = (
  <>
    <Image
      alt="Featured resource"
      src={exampleImage}
      width={480}
      height={400}
      className={`${styles.customRegionImage} ${styles.customRegionSideImage}`}
    />
    <StackLayout gap={1}>
      <StackLayout gap={0}>
        <Text styleAs="h2" as="h2">
          Featured Resource
        </Text>
        <Text className={styles.customRegionRightDescription}>
          Explore our latest accessibility guidelines to ensure your components
          meet ADA standards and provide an inclusive user experience.
        </Text>
      </StackLayout>
      <Link
        color="primary"
        underline="default"
        href="#link"
        style={{ width: "fit-content" }}
      >
        View guidelines
      </Link>
    </StackLayout>
  </>
);

const supportingLinks = (
  <FlexLayout gap={3}>
    <Link color="primary" underline="default" href="#link">
      Book a demo
    </Link>
    <Link color="primary" underline="default" href="#link">
      Support center
    </Link>
  </FlexLayout>
);

const main = (
  <MegaMenuBody>
    <MegaMenuGroups className={styles.customRegionSideSection}>
      <MegaMenuGroup>
        <MegaMenuGroupHeading>Financial services</MegaMenuGroupHeading>
        <MegaMenuList>
          <MegaMenuListItem
            render={<RouterLink to="/digital-banking" />}
            onClick={() =>
              console.log("MegaMenuListItem clicked:", "/digital-banking")
            }
          >
            Digital banking
          </MegaMenuListItem>
          <MegaMenuListItem
            render={<RouterLink to="/risk-management" />}
            onClick={() =>
              console.log("MegaMenuListItem clicked:", "/risk-management")
            }
          >
            Risk management
          </MegaMenuListItem>
        </MegaMenuList>
      </MegaMenuGroup>
      <MegaMenuGroup>
        <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
        <MegaMenuList>
          <MegaMenuListItem
            render={<RouterLink to="/patient-management" />}
            onClick={() =>
              console.log("MegaMenuListItem clicked:", "/patient-management")
            }
          >
            Patient management
          </MegaMenuListItem>
          <MegaMenuListItem
            render={<RouterLink to="/telemedicine" />}
            onClick={() =>
              console.log("MegaMenuListItem clicked:", "/telemedicine")
            }
          >
            Telemedicine
          </MegaMenuListItem>
          <MegaMenuListItem
            render={<RouterLink to="/compliance-solutions" />}
            onClick={() =>
              console.log("MegaMenuListItem clicked:", "/compliance-solutions")
            }
          >
            Compliance solutions
          </MegaMenuListItem>
        </MegaMenuList>
      </MegaMenuGroup>
      <MegaMenuGroup>
        <MegaMenuGroupHeading>Retail</MegaMenuGroupHeading>
        <MegaMenuList>
          <MegaMenuListItem
            render={<RouterLink to="/e-commerce-platforms" />}
            onClick={() =>
              console.log("MegaMenuListItem clicked:", "/e-commerce-platforms")
            }
          >
            E-commerce platforms
          </MegaMenuListItem>
        </MegaMenuList>
      </MegaMenuGroup>
      <MegaMenuGroup>
        <MegaMenuGroupHeading>Manufacturing</MegaMenuGroupHeading>
        <MegaMenuList>
          <MegaMenuListItem
            render={<RouterLink to="/supply-chain-optimization" />}
            onClick={() =>
              console.log(
                "MegaMenuListItem clicked:",
                "/supply-chain-optimization",
              )
            }
          >
            Supply chain optimization
          </MegaMenuListItem>
          <MegaMenuListItem
            render={<RouterLink to="/quality-control" />}
            onClick={() =>
              console.log("MegaMenuListItem clicked:", "/quality-control")
            }
          >
            Quality control
          </MegaMenuListItem>
          <MegaMenuListItem
            render={<RouterLink to="/production-planning" />}
            onClick={() =>
              console.log("MegaMenuListItem clicked:", "/production-planning")
            }
          >
            Production planning
          </MegaMenuListItem>
        </MegaMenuList>
      </MegaMenuGroup>
    </MegaMenuGroups>
    <MegaMenuSupportingActions>{supportingLinks}</MegaMenuSupportingActions>
  </MegaMenuBody>
);

export const WithContent = (): ReactElement => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <MockHistory>
      <nav aria-label="with supporting content">
        <StackLayout as="ul" direction="row" gap={1} className={styles.navList}>
          <li>
            <MegaMenu
              open={openMenu === "right"}
              onOpenChange={(open) => setOpenMenu(open ? "right" : null)}
            >
              <MegaMenuTrigger>
                <Button>Content on right</Button>
              </MegaMenuTrigger>
              {/* Aside placed after Main renders to the right. The footer lives
                inside Main, along the bottom of the columns. */}
              <MegaMenuPanel
                aria-label="Content on right menu"
                className={`${styles.customRegionNoContainerPadding} ${styles.customRegionSide}`}
              >
                {main}
                <MegaMenuSupportingContent
                  className={styles.customRegionSideContent}
                >
                  {featuredResource}
                </MegaMenuSupportingContent>
              </MegaMenuPanel>
            </MegaMenu>
          </li>

          <li>
            <MegaMenu
              open={openMenu === "left"}
              onOpenChange={(open) => setOpenMenu(open ? "left" : null)}
            >
              <MegaMenuTrigger>
                <Button>Content on left</Button>
              </MegaMenuTrigger>
              {/* Aside placed before Main renders to the left. The footer lives
                inside Main, along the bottom of the columns. */}
              <MegaMenuPanel
                aria-label="Content on left menu"
                className={`${styles.customRegionNoContainerPadding} ${styles.customRegionSide}`}
              >
                <MegaMenuSupportingContent
                  className={styles.customRegionSideContent}
                >
                  {featuredResource}
                </MegaMenuSupportingContent>
                {main}
              </MegaMenuPanel>
            </MegaMenu>
          </li>
        </StackLayout>
      </nav>
    </MockHistory>
  );
};
