import { useAppHeader } from "@jpmorganchase/mosaic-store";
import { Button, type ComboBoxProps, Tooltip } from "@salt-ds/core";
import { GithubIcon, MenuIcon } from "@salt-ds/icons";
import dynamic from "next/dynamic";
import { useContext, useEffect, useState } from "react";
import { LayoutContext } from "../../layouts/LayoutContext";
import { CTALink } from "../cta-link/CTALink";
import { LinkBase } from "../link/Link";
import { Logo } from "../logo/Logo";
import { ModeToggle } from "../mode-switch/ModeToggle";
import styles from "./AppHeader.module.css";

const Search = dynamic<ComboBoxProps>(() =>
  import("../search").then((mod) => mod.Search),
);

export const AppHeader = () => {
  const layoutContext = useContext(LayoutContext);
  const appHeader = useAppHeader();
  const homeLink = appHeader?.homeLink;
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  // A retained header can hydrate before Base registers its page-owned drawer.
  // Keep the server-rendered trigger disabled until both can handle the click.
  const drawerReady =
    hydrated && (!layoutContext.setMainId || !!layoutContext.mainId);

  return (
    <header className={styles.root}>
      <Button
        aria-label="Open menu"
        className={styles.menuButton}
        disabled={!drawerReady}
        appearance="transparent"
        sentiment="neutral"
        onClick={() => layoutContext.setDrawerOpen(true)}
      >
        <MenuIcon aria-hidden />
      </Button>
      <div className={styles.content}>
        {homeLink && (
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
          <Tooltip
            aria-hidden="true"
            className={styles.githubTooltip}
            content="GitHub repository"
            placement="bottom"
          >
            <CTALink
              className={styles.githubLink}
              href="https://github.com/jpmorganchase/salt-ds"
              aria-label="GitHub repository"
              sentiment="neutral"
              target="_blank"
            >
              <GithubIcon aria-hidden />
            </CTALink>
          </Tooltip>
          <ModeToggle appearance="transparent" />
        </div>
      </div>
    </header>
  );
};
