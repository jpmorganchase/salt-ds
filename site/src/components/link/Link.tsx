import { Link as SaltLink } from "@salt-ds/core";
import NextLink from "next/link";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { useResolveRelativeUrl } from "../../utils/useResolveRelativeUrl";

export const LinkBase = forwardRef<
  HTMLAnchorElement,
  Omit<
    ComponentPropsWithoutRef<"a"> & ComponentPropsWithoutRef<typeof NextLink>,
    "color"
  >
>(function Link({ href, ...rest }, ref) {
  const url = useResolveRelativeUrl(href);

  if (href?.startsWith("#")) {
    return <SaltLink ref={ref} href={href} {...rest} />;
  }

  return <NextLink ref={ref} href={url} {...rest} />;
});
