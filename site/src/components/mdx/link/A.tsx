import { type LinkProps, Link as SaltLink } from "@salt-ds/core";
import type { FC, PropsWithChildren } from "react";
import { clsx } from "clsx";
import styles from "./A.module.css";
import { LinkBase } from "../../link/Link";

export interface MarkdownLinkProps extends LinkProps {
  href: string;
}

export const Link: FC<PropsWithChildren<MarkdownLinkProps>> = ({
  href,
  className,
  ...rest
}) => {
  return (
    <SaltLink
      color="accent"
      render={<LinkBase href={href} />}
      href={href}
      className={clsx(styles.root, className)}
      {...rest}
      IconComponent={null}
    />
  );
};
