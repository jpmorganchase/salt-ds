import { clsx } from "clsx";
import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import styles from "./Logo.module.css";
import logoLDDark from "./logo_ld_dark.svg";
import logoLDLight from "./logo_ld_light.svg";
import logoTDDark from "./logo_td_dark.svg";
import logoTDLight from "./logo_td_light.svg";

export function Logo({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={clsx(styles.root, className)} {...props}>
      <Image
        src={logoLDDark}
        alt=""
        fetchPriority="high"
        className={styles.logoLDDark}
      />
      <Image
        src={logoLDLight}
        alt=""
        fetchPriority="high"
        className={styles.logoLDLight}
      />
      <Image
        src={logoTDDark}
        alt=""
        fetchPriority="high"
        className={styles.logoTDDark}
      />
      <Image
        src={logoTDLight}
        alt=""
        fetchPriority="high"
        className={styles.logoTDLight}
      />
    </div>
  );
}
