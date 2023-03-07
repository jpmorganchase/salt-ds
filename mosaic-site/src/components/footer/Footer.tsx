import React, { FC } from "react";
import classnames from "classnames";
import { FooterProps as MosaicFooterProps } from "@jpmorganchase/mosaic-site-components";
import { Link } from "@salt-ds/core";
import styles from "./Footer.module.css";

type FooterLinkItem = {
  label?: string;
  to?: string;
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
  <footer className={classnames(styles.footer, className)}>
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
