import React from "react";

import {
  Link as LinkComponent,
  LinkProps,
} from "@jpmorganchase/mosaic-components";
import styles from "./A.module.css";

export interface MarkdownLinkProps extends LinkProps {
  href?: string;
}

export const Link: React.FC<React.PropsWithChildren<MarkdownLinkProps>> = ({
  href,
  ...rest
}) => (
  <LinkComponent
    className={styles.a}
    link={href}
    variant="document"
    endIcon="none"
    {...rest}
  />
);
