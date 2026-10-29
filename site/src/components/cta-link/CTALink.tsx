import { LinkButton, type LinkButtonProps } from "@salt-ds/core";
import Link from "next/link";
import { forwardRef } from "react";

export interface CTALinkProps extends LinkButtonProps {
  href: string;
}

export const CTALink = forwardRef<HTMLAnchorElement, CTALinkProps>(
  function CTALink({ href, ...rest }, ref) {
    return (
      <LinkButton
        render={<Link href={href} />}
        ref={ref}
        IconComponent={null}
        {...rest}
      />
    );
  },
);
