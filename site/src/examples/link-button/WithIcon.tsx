import { LinkButton, StackLayout } from "@salt-ds/core";
import { ArrowLeftIcon, ArrowRightIcon, SaltShakerIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const WithIcon = (): ReactElement => (
  <StackLayout align="start">
    <LinkButton href="/salt/components/card">
      View card documentation <ArrowRightIcon aria-hidden />
    </LinkButton>
    <LinkButton href="/salt/getting-started">
      <ArrowLeftIcon aria-hidden /> Back to get started
    </LinkButton>
    <LinkButton href="https://github.com/jpmorganchase/salt-ds">
      <SaltShakerIcon aria-hidden /> Learn more about Salt
      <ArrowRightIcon aria-hidden />
    </LinkButton>
  </StackLayout>
);
