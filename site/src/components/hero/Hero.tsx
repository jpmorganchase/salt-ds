import { H1, Text } from "@salt-ds/core";
import Image from "next/image";
import { CTALink } from "../cta-link/CTALink";
import styles from "./Hero.module.css";
import background from "./hero.svg";
import { ModeToggle } from "../mode-switch/ModeToggle";
import logoLDLight from "./jpm_ld_light.svg";
import logoLDDark from "./jpm_ld_dark.svg";
import logoTDLight from "./jpm_td_light.svg";
import logoTDDark from "./jpm_td_dark.svg";
import { useColorMode } from "@jpmorganchase/mosaic-store";
import { useIsMobileView } from "../../utils/useIsMobileView";

const logoMap = {
  dark: {
    mobile: logoTDDark,
    desktop: logoLDDark,
  },
  light: {
    mobile: logoTDLight,
    desktop: logoLDLight,
  },
};

export function Hero() {
  const colorMode = useColorMode();
  const isMobileOrTablet = useIsMobileView();

  const src = logoMap[colorMode][isMobileOrTablet ? "mobile" : "desktop"];

  return (
    <div className={styles.root}>
      <Image
        className={styles.background}
        alt=""
        src={background}
        fill
        priority
      />
      <div className={styles.content}>
        <Image src={src} alt="" priority />
        <H1 styleAs="display2" className={styles.title}>
          <strong>Salt Design System</strong>
        </H1>
        <Text>
          Salt is J.P. Morgan's open-source design system, providing accessible
          components and extensive design resources to create exceptional
          digital experiences across lines of business.
        </Text>
        <div className={styles.actions}>
          <CTALink href="/salt/getting-started">Get started</CTALink>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
