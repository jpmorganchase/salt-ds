import { Breadcrumb, Breadcrumbs } from "@salt-ds/core";
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
    <Breadcrumbs
      aria-label="Breadcrumbs"
      maxItems={3}
      render={renderRouterLink}
    >
      <Breadcrumb href="/">Home</Breadcrumb>
      <Breadcrumb href="/level-2">Level 2</Breadcrumb>
      <Breadcrumb href="/level-2/level-3">Level 3</Breadcrumb>
      <Breadcrumb href="/level-2/level-3/current">Current level</Breadcrumb>
    </Breadcrumbs>
  </MemoryRouter>
);
