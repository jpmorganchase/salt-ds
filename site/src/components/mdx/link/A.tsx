import type { FC, PropsWithChildren } from "react";

import {
  Link as LinkComponent,
  type LinkProps,
} from "@jpmorganchase/mosaic-components";
import styles from "./A.module.css";

export interface MarkdownLinkProps extends LinkProps {
  href?: string;
}

export const Link: FC<PropsWithChildren<MarkdownLinkProps>> = ({
  href,
  ...rest
}) => {
  return (
    <LinkComponent
      className={styles.a}
      link={href}
      variant="document"
      endIcon="none"
      {...rest}
    />
  );
};
