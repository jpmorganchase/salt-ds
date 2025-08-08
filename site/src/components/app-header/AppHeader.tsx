import { useAppHeader } from "@jpmorganchase/mosaic-store";
import { Button, type ComboBoxProps, Tooltip } from "@salt-ds/core";
import { GithubIcon, MenuIcon } from "@salt-ds/icons";
import dynamic from "next/dynamic";
import { useContext } from "react";
import { LayoutContext } from "../../layouts/LayoutContext";
import { useIsMobileView } from "../../utils/useIsMobileView";
import { CTALink } from "../cta-link/CTALink";
import { LinkBase } from "../link/Link";
import { Logo } from "../logo/Logo";
import { ModeToggle } from "../mode-switch/ModeToggle";
import styles from "./AppHeader.module.css";

const Search = dynamic<ComboBoxProps>(() =>
  import("../search").then((mod) => mod.Search),
);

export const AppHeader = () => {
  const isMobileOrTablet = useIsMobileView();
  const layoutContext = useContext(LayoutContext);
  const appHeader = useAppHeader();
  const homeLink = appHeader?.homeLink;

  return (
    <header className={styles.root}>
      {isMobileOrTablet && (
        <Button
          aria-label="Open menu"
          appearance="transparent"
          sentiment="neutral"
          onClick={() => layoutContext.setDrawerOpen(true)}
        >
          <MenuIcon aria-hidden />
        </Button>
      )}
      <div className={styles.content}>
        {homeLink && !isMobileOrTablet && (
          <LinkBase
            aria-label="Salt Design System Homepage"
            className={styles.logoLink}
            href={homeLink}
          >
            <Logo />
          </LinkBase>
        )}
        <div className={styles.actions}>
          <Search className={styles.search} />
          {!isMobileOrTablet && (
            <Tooltip
              aria-hidden="true"
              content="GitHub repository"
              placement="bottom"
            >
              <CTALink
                href="https://github.com/jpmorganchase/salt-ds"
                aria-label="GitHub repository"
                sentiment="neutral"
                appearance="transparent"
                target="_blank"
              >
                <GithubIcon aria-hidden />
              </CTALink>
            </Tooltip>
          )}
          <ModeToggle appearance="transparent" />
        </div>
      </div>
    </header>
  );
};
