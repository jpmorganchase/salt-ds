import { useColorMode } from "@jpmorganchase/mosaic-store";
import Image from "next/image";
import styles from "./Logo.module.css";
import lightLDLogo from "./logo_ld_light.svg";
import darkLDLogo from "./logo_ld_dark.svg";
import lightTDLogo from "./logo_td_light.svg";
import darkTDLogo from "./logo_td_dark.svg";

import { useIsMobileView } from "../../utils/useIsMobileView";

const logoMap: Record<"dark" | "light", Record<string, string>> = {
  dark: {
    mobile: darkTDLogo,
    desktop: darkLDLogo,
  },
  light: {
    mobile: lightTDLogo,
    desktop: lightLDLogo,
  },
};

export function Logo() {
  const mode = useColorMode();
  const isMobileOrTablet = useIsMobileView();

  const src = logoMap[mode][isMobileOrTablet ? "mobile" : "desktop"];

  return (
    <div className={styles.root}>
      <Image src={src} alt="" />
    </div>
  );
}
