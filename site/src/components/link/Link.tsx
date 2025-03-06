import { type ComponentPropsWithoutRef, forwardRef } from "react";
import NextLink from "next/link";
import { useResolveRelativeUrl } from "@jpmorganchase/mosaic-site-components";

export const LinkBase = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<typeof NextLink>
>(function Link({ href, ...rest }, ref) {
  const url = useResolveRelativeUrl(href);

  return <NextLink ref={ref} href={url} {...rest} />;
});
