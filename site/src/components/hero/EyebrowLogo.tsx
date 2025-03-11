import Image from "next/image";
import styles from "./EyebrowLogo.module.css";
import logoLDDark from "./jpm_ld_dark.svg";
import logoLDLight from "./jpm_ld_light.svg";
import logoTDDark from "./jpm_td_dark.svg";
import logoTDLight from "./jpm_td_light.svg";

export function EyebrowLogo() {
  return (
    <>
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
    </>
  );
}
