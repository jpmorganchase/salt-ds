import { Button, FlexLayout, Link, StackLayout, Text } from "@salt-ds/core";
import { ChevronRightIcon } from "@salt-ds/icons";
import {
  MegaMenu,
  MegaMenuBand,
  MegaMenuGroup,
  MegaMenuGroups,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuPanel,
  MegaMenuRegion,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";
import { Link as RouterLink } from "react-router";
import styles from "./index.module.css";
import { MockHistory } from "./MockHistory";

const exampleImage = "/img/examples/image-skeleton.png";

const featuredResource = (
  <>
    <img
      alt="Featured resource"
      src={exampleImage}
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
        IconComponent={ChevronRightIcon}
        style={{ width: "fit-content" }}
      >
        View guidelines
      </Link>
    </StackLayout>
  </>
);

const supportingLinks = (
  <FlexLayout gap={3}>
    <Link
      color="primary"
      underline="default"
      href="#link"
      IconComponent={ChevronRightIcon}
    >
      Book a demo
    </Link>
    <Link
      color="primary"
      underline="default"
      href="#link"
      IconComponent={ChevronRightIcon}
    >
      Support center
    </Link>
  </FlexLayout>
);

const groups = (
  <MegaMenuGroups className={styles.customRegionSideSection}>
    <MegaMenuGroup>
      <MegaMenuHeader>Financial services</MegaMenuHeader>
      <MegaMenuItem
        render={<RouterLink to="/digital-banking" />}
        onClick={() => console.log("MegaMenuItem clicked:", "/digital-banking")}
      >
        Digital banking
      </MegaMenuItem>
      <MegaMenuItem
        render={<RouterLink to="/risk-management" />}
        onClick={() => console.log("MegaMenuItem clicked:", "/risk-management")}
      >
        Risk management
      </MegaMenuItem>
    </MegaMenuGroup>
    <MegaMenuGroup>
      <MegaMenuHeader>Healthcare</MegaMenuHeader>
      <MegaMenuItem
        render={<RouterLink to="/patient-management" />}
        onClick={() =>
          console.log("MegaMenuItem clicked:", "/patient-management")
        }
      >
        Patient management
      </MegaMenuItem>
      <MegaMenuItem
        render={<RouterLink to="/telemedicine" />}
        onClick={() => console.log("MegaMenuItem clicked:", "/telemedicine")}
      >
        Telemedicine
      </MegaMenuItem>
      <MegaMenuItem
        render={<RouterLink to="/compliance-solutions" />}
        onClick={() =>
          console.log("MegaMenuItem clicked:", "/compliance-solutions")
        }
      >
        Compliance solutions
      </MegaMenuItem>
    </MegaMenuGroup>
    <MegaMenuGroup>
      <MegaMenuHeader>Retail</MegaMenuHeader>
      <MegaMenuItem
        render={<RouterLink to="/e-commerce-platforms" />}
        onClick={() =>
          console.log("MegaMenuItem clicked:", "/e-commerce-platforms")
        }
      >
        E-commerce platforms
      </MegaMenuItem>
    </MegaMenuGroup>
    <MegaMenuGroup>
      <MegaMenuHeader>Manufacturing</MegaMenuHeader>
      <MegaMenuItem
        render={<RouterLink to="/supply-chain-optimization" />}
        onClick={() =>
          console.log("MegaMenuItem clicked:", "/supply-chain-optimization")
        }
      >
        Supply chain optimization
      </MegaMenuItem>
      <MegaMenuItem
        render={<RouterLink to="/quality-control" />}
        onClick={() => console.log("MegaMenuItem clicked:", "/quality-control")}
      >
        Quality control
      </MegaMenuItem>
      <MegaMenuItem
        render={<RouterLink to="/production-planning" />}
        onClick={() =>
          console.log("MegaMenuItem clicked:", "/production-planning")
        }
      >
        Production planning
      </MegaMenuItem>
    </MegaMenuGroup>
  </MegaMenuGroups>
);

export const WithContent = (): ReactElement => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <MockHistory>
      <FlexLayout gap={2}>
        <MegaMenu
          open={openMenu === "right"}
          onOpenChange={(open) => setOpenMenu(open ? "right" : null)}
        >
          <MegaMenuTrigger>
            <Button>Content on right</Button>
          </MegaMenuTrigger>
          {/* Region placed after Groups renders to the right; Band after
              Groups renders along the bottom. */}
          <MegaMenuPanel
            aria-label="Content on right menu"
            className={`${styles.customRegionNoContainerPadding} ${styles.customRegionSide}`}
          >
            {groups}
            <MegaMenuBand>{supportingLinks}</MegaMenuBand>
            <MegaMenuRegion className={styles.customRegionSideContent}>
              {featuredResource}
            </MegaMenuRegion>
          </MegaMenuPanel>
        </MegaMenu>

        <MegaMenu
          open={openMenu === "left"}
          onOpenChange={(open) => setOpenMenu(open ? "left" : null)}
        >
          <MegaMenuTrigger>
            <Button>Content on left</Button>
          </MegaMenuTrigger>
          {/* Region placed before Groups renders to the left. */}
          <MegaMenuPanel
            aria-label="Content on left menu"
            className={`${styles.customRegionNoContainerPadding} ${styles.customRegionSide}`}
          >
            <MegaMenuRegion className={styles.customRegionSideContent}>
              {featuredResource}
            </MegaMenuRegion>
            {groups}
            <MegaMenuBand>{supportingLinks}</MegaMenuBand>
          </MegaMenuPanel>
        </MegaMenu>
      </FlexLayout>
    </MockHistory>
  );
};
