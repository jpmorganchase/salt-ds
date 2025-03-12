import { Link as SaltLink } from "@salt-ds/core";
import clsx from "clsx";
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
              >
                {label}
              </SaltLink>
            </div>
          ))}
        </div>
        <div className={styles.copyright}>
          © {new Date().getFullYear()} JPMorgan Chase & Co. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
