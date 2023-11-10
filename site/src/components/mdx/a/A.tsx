import NextLink from "next/link";
import React, { Ref } from "react";
import { useResolveRelativeUrl } from "@jpmorganchase/mosaic-site-components";
import { Link } from "@salt-ds/core";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export const A = React.forwardRef(function A(
  { href = "", ...props }: LinkProps,
  ref: Ref<HTMLAnchorElement>
) {
  const url = useResolveRelativeUrl(href);

  return (
    <NextLink as={url} href={url} ref={ref} {...props} passHref legacyBehavior>
      <Link />
    </NextLink>
  );
});
