import type { TabsMenu } from "@jpmorganchase/mosaic-components";
import { StackLayout, Tooltip } from "@salt-ds/core";
import { GithubIcon } from "@salt-ds/icons";
import type { FC } from "react";
import { CTALink } from "../cta-link/CTALink";
import { Logo } from "../logo/Logo";
import { Search } from "../search";
import styles from "./AppHeader.module.css";
import { ModeToggle } from "../mode-switch/ModeToggle";
import { useIsMobileView } from "../../utils/useIsMobileView";
import { LinkBase } from "../link/Link";

export interface AppHeaderProps {
  homeLink?: string;
  logo?: string;
  menu?: TabsMenu;
  title?: string;
}

export const AppHeader: FC<AppHeaderProps> = ({ homeLink, menu = [] }) => {
  const isMobileOrTablet = useIsMobileView();

  return (
    <header className={styles.root}>
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
    </header>
  );
};
