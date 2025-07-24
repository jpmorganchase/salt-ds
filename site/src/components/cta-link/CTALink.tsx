import type { ButtonProps } from "@salt-ds/core";
import { clsx } from "clsx";
import Link from "next/link";
import { type ComponentProps, forwardRef } from "react";
import styles from "./CTALink.module.css";

export interface CTALinkProps extends ComponentProps<"a"> {
  href: string;
  appearance?: ButtonProps["appearance"];
  sentiment?: ButtonProps["sentiment"];
}

export const CTALink = forwardRef<HTMLAnchorElement, CTALinkProps>(
  function CTALink(
    { appearance = "solid", sentiment = "accented", ...rest },
    ref,
  ) {
    return (
      <Link
        className={clsx(styles.root, styles[appearance], styles[sentiment])}
        ref={ref}
        {...rest}
      />
    );
  },
);
