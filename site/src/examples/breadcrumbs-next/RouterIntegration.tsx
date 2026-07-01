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
      <BreadcrumbNext href="/accounts">Accounts</BreadcrumbNext>
      <BreadcrumbNext href="/accounts/asset-management">
        Asset management
      </BreadcrumbNext>
      <BreadcrumbNext href="/accounts/asset-management/fixed-income">
        Fixed income
      </BreadcrumbNext>
      <BreadcrumbNext href="/accounts/asset-management/equities">
        Equities
      </BreadcrumbNext>
      <BreadcrumbNext>Portfolio</BreadcrumbNext>
    </BreadcrumbsNext>
  </MemoryRouter>
);
