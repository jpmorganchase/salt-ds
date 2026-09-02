import { LinkButton, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Underline = (): ReactElement => (
  <StackLayout align="start">
    <LinkButton href="/salt/components/breadcrumbs">
      View breadcrumbs documentation
    </LinkButton>
    <LinkButton href="/salt/components/navigation-item" underline="never">
      View navigation guidance
    </LinkButton>
  </StackLayout>
);
