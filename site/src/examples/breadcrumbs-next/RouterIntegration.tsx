import { BreadcrumbNext, BreadcrumbsNext } from "@salt-ds/lab";
import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { forwardRef } from "react";

const RouterLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<"a">>(
  function RouterLink(props, ref) {
    return <a {...props} data-router-link="" ref={ref} />;
  },
);

export const RouterIntegration = (): ReactElement => (
  <BreadcrumbsNext aria-label="Breadcrumb">
    <BreadcrumbNext
      href="/root"
      label="Root Level Entity"
      render={(linkProps) => <RouterLink {...linkProps} />}
    />
    <BreadcrumbNext
      href="/root/level-2"
      label="Level 2 Entity"
      render={(linkProps) => <RouterLink {...linkProps} />}
    />
    <BreadcrumbNext label="Level 3 Entity" />
  </BreadcrumbsNext>
);
