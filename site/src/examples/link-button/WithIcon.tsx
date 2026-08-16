import { StackLayout } from "@salt-ds/core";
import { ArrowLeftIcon, ArrowRightIcon } from "@salt-ds/icons";
import { LinkButton } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithIcon = (): ReactElement => (
  <StackLayout align="start">
    <LinkButton href="/salt/components/card">
      View card documentation <ArrowRightIcon aria-hidden />
    </LinkButton>
    <LinkButton href="/salt/getting-started">
      <ArrowLeftIcon aria-hidden /> Back to getting started
    </LinkButton>
  </StackLayout>
);
