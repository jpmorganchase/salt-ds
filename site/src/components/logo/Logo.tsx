import { useColorMode } from "@jpmorganchase/mosaic-store";
import { clsx } from "clsx";
import Image from "next/image";
import styles from "./Logo.module.css";
import darkLDLogo from "./logo_ld_dark.svg";
import lightLDLogo from "./logo_ld_light.svg";
import darkTDLogo from "./logo_td_dark.svg";
import lightTDLogo from "./logo_td_light.svg";

import type { ComponentPropsWithoutRef } from "react";
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

export function Logo({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  const mode = useColorMode();
  const isMobileOrTablet = useIsMobileView();

  const src = logoMap[mode][isMobileOrTablet ? "mobile" : "desktop"];

  return (
    <div className={clsx(styles.root, className)} {...props}>
      <Image src={src} alt="" />
    </div>
  );
}
