import { Link as SaltLink, Text } from "@salt-ds/core";
import { SaltShakerSolidIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import NextLink from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import styles from "./Footer.module.css";

export interface FooterProps extends ComponentPropsWithoutRef<"footer"> {}

const links = [
  { label: "Terms of use", to: "https://www.jpmorgan.com/terms" },
  { label: "Privacy policy", to: "https://www.jpmorgan.com/privacy" },
  { label: "Contact us", to: "/salt/support-and-contributions/index" },
];

export function Footer({ className }: FooterProps) {
  return (
    <footer className={clsx(styles.footer, className)}>
      <div className={styles.container}>
        <div className={styles.links}>
          {links.map(({ label, to }) => (
            <div className={styles.linkContainer} key={label}>
              <SaltLink
                color="secondary"
                render={<NextLink href={to} />}
                href={to}
                underline="never"
                styleAs="notation"
              >
                {label}
              </SaltLink>
            </div>
          ))}
        </div>
        <div className={styles.copyrightContainer}>
          <Text
            color="secondary"
            styleAs="notation"
            className={styles.saltMessage}
          >
            <SaltShakerSolidIcon aria-hidden /> Site by Salt with Salt.
          </Text>
          <Text
            className={styles.copyright}
            color="secondary"
            styleAs="notation"
          >
            ©&nbsp;{new Date().getFullYear()} JPMorgan Chase & Co. All rights
            reserved.
          </Text>
        </div>
      </div>
    </footer>
  );
}
