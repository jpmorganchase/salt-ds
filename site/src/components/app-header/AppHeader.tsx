import { useAppHeader } from "@jpmorganchase/mosaic-store";
import { Button, StackLayout, Tooltip } from "@salt-ds/core";
import { GithubIcon, MenuIcon } from "@salt-ds/icons";
import { useContext } from "react";
import { LayoutContext } from "../../layouts/LayoutContext";
import { useIsMobileView } from "../../utils/useIsMobileView";
import { CTALink } from "../cta-link/CTALink";
import { LinkBase } from "../link/Link";
import { Logo } from "../logo/Logo";
import { ModeToggle } from "../mode-switch/ModeToggle";
import { Search } from "../search";
import styles from "./AppHeader.module.css";

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
          appearance="bordered"
          sentiment="neutral"
          onClick={() => layoutContext.setDrawerOpen(true)}
        >
          <MenuIcon aria-hidden />
        </Button>
      )}
      <div className={styles.content}>
        {homeLink && !isMobileOrTablet && (
          <LinkBase className={styles.logoLink} href={homeLink}>
            <Logo />
          </LinkBase>
        )}
        <StackLayout
          direction="row"
          align="center"
          gap={1}
          className={styles.actions}
        >
          <Search className={styles.search} />
          {!isMobileOrTablet && (
            <Tooltip content="Github repository" placement="bottom">
              <CTALink
                href="https://github.com/jpmorganchase/salt-ds"
                aria-label="GitHub repository"
                sentiment="neutral"
                appearance="bordered"
              >
                <GithubIcon aria-hidden />
              </CTALink>
            </Tooltip>
          )}
          <ModeToggle />
        </StackLayout>
      </div>
    </header>
  );
};
