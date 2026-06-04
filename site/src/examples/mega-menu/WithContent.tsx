import { Button, FlexLayout, Link, StackLayout, Text } from "@salt-ds/core";
import { ChevronRightIcon } from "@salt-ds/icons";
import {
  MegaMenu,
  MegaMenuAside,
  MegaMenuFooter,
  MegaMenuHeading,
  MegaMenuLink,
  MegaMenuMain,
  MegaMenuPanel,
  MegaMenuSection,
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

const main = (
  <MegaMenuMain className={styles.customRegionSideSection}>
    <MegaMenuSection>
      <MegaMenuHeading>Financial services</MegaMenuHeading>
      <MegaMenuLink
        render={<RouterLink to="/digital-banking" />}
        onClick={() => console.log("MegaMenuLink clicked:", "/digital-banking")}
      >
        Digital banking
      </MegaMenuLink>
      <MegaMenuLink
        render={<RouterLink to="/risk-management" />}
        onClick={() => console.log("MegaMenuLink clicked:", "/risk-management")}
      >
        Risk management
      </MegaMenuLink>
    </MegaMenuSection>
    <MegaMenuSection>
      <MegaMenuHeading>Healthcare</MegaMenuHeading>
      <MegaMenuLink
        render={<RouterLink to="/patient-management" />}
        onClick={() =>
          console.log("MegaMenuLink clicked:", "/patient-management")
        }
      >
        Patient management
      </MegaMenuLink>
      <MegaMenuLink
        render={<RouterLink to="/telemedicine" />}
        onClick={() => console.log("MegaMenuLink clicked:", "/telemedicine")}
      >
        Telemedicine
      </MegaMenuLink>
      <MegaMenuLink
        render={<RouterLink to="/compliance-solutions" />}
        onClick={() =>
          console.log("MegaMenuLink clicked:", "/compliance-solutions")
        }
      >
        Compliance solutions
      </MegaMenuLink>
    </MegaMenuSection>
    <MegaMenuSection>
      <MegaMenuHeading>Retail</MegaMenuHeading>
      <MegaMenuLink
        render={<RouterLink to="/e-commerce-platforms" />}
        onClick={() =>
          console.log("MegaMenuLink clicked:", "/e-commerce-platforms")
        }
      >
        E-commerce platforms
      </MegaMenuLink>
    </MegaMenuSection>
    <MegaMenuSection>
      <MegaMenuHeading>Manufacturing</MegaMenuHeading>
      <MegaMenuLink
        render={<RouterLink to="/supply-chain-optimization" />}
        onClick={() =>
          console.log("MegaMenuLink clicked:", "/supply-chain-optimization")
        }
      >
        Supply chain optimization
      </MegaMenuLink>
      <MegaMenuLink
        render={<RouterLink to="/quality-control" />}
        onClick={() => console.log("MegaMenuLink clicked:", "/quality-control")}
      >
        Quality control
      </MegaMenuLink>
      <MegaMenuLink
        render={<RouterLink to="/production-planning" />}
        onClick={() =>
          console.log("MegaMenuLink clicked:", "/production-planning")
        }
      >
        Production planning
      </MegaMenuLink>
    </MegaMenuSection>
    <MegaMenuFooter>{supportingLinks}</MegaMenuFooter>
  </MegaMenuMain>
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
          {/* Aside placed after Main renders to the right. The footer lives
              inside Main, along the bottom of the columns. */}
          <MegaMenuPanel
            aria-label="Content on right menu"
            className={`${styles.customRegionNoContainerPadding} ${styles.customRegionSide}`}
          >
            {main}
            <MegaMenuAside className={styles.customRegionSideContent}>
              {featuredResource}
            </MegaMenuAside>
          </MegaMenuPanel>
        </MegaMenu>

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
            <MegaMenuAside className={styles.customRegionSideContent}>
              {featuredResource}
            </MegaMenuAside>
            {main}
          </MegaMenuPanel>
        </MegaMenu>
      </FlexLayout>
    </MockHistory>
  );
};
