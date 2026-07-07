import { BreadcrumbNext, BreadcrumbsNext } from "@salt-ds/lab";
import type { ComponentPropsWithoutRef, ReactElement, Ref } from "react";
import { MemoryRouter, Link as RouterLink } from "react-router";

type RouterLinkProps = ComponentPropsWithoutRef<"a"> & {
  ref?: Ref<HTMLAnchorElement>;
};

function renderRouterLink({ href = "", ...props }: RouterLinkProps) {
  return <RouterLink {...props} to={href} />;
}

export const RouterIntegration = (): ReactElement => (
  <MemoryRouter>
    <BreadcrumbsNext
      aria-label="Breadcrumb"
      maxItems={3}
      render={renderRouterLink}
    >
      <BreadcrumbNext href="/">Home</BreadcrumbNext>
      <BreadcrumbNext href="/level-2">Level 2</BreadcrumbNext>
      <BreadcrumbNext href="/level-2/level-3">Level 3</BreadcrumbNext>
      <BreadcrumbNext>Current level</BreadcrumbNext>
    </BreadcrumbsNext>
  </MemoryRouter>
);
