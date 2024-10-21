import {
  Link,
  type FooterProps as MosaicFooterProps,
} from "@jpmorganchase/mosaic-site-components";
import clsx from "clsx";
import type { FC } from "react";
import styles from "./Footer.module.css";

type FooterLinkItem = {
  label?: string;
  to: string;
};

export interface FooterProps extends MosaicFooterProps {
  links?: FooterLinkItem[];
  copyright?: string;
}

const defaultCopyright = `© ${new Date().getFullYear()} JPMorgan Chase & Co. All rights reserved.`;

export const Footer: FC<FooterProps> = ({
  className,
  links = [],
  copyright = defaultCopyright,
}) => (
  <footer className={clsx(styles.footer, className)}>
    <div className={styles.container}>
      <div className={styles.links}>
        {links.map(({ label, to }) => (
          <div className={styles.linkContainer} key={label}>
            <Link href={to}>{label}</Link>
          </div>
        ))}
      </div>

      <div className={styles.copyright}>{copyright}</div>
    </div>
  </footer>
);
