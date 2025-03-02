import { useColorMode } from "@jpmorganchase/mosaic-store";
import { H1, Text } from "@salt-ds/core";
import Image from "next/image";
import { useIsMobileView } from "../../utils/useIsMobileView";
import { CTALink } from "../cta-link/CTALink";
import { ModeToggle } from "../mode-switch/ModeToggle";
import styles from "./Hero.module.css";
import background from "./hero.svg";
import logoLDDark from "./jpm_ld_dark.svg";
import logoLDLight from "./jpm_ld_light.svg";
import logoTDDark from "./jpm_td_dark.svg";
import logoTDLight from "./jpm_td_light.svg";

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
        <div className={styles.eyebrow}>
          <Image src={src} alt="" priority />
          <H1 styleAs="display2" className={styles.title}>
            <strong>Salt Design System</strong>
          </H1>
        </div>
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
