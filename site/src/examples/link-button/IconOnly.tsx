import { FlowLayout, LinkButton, Tooltip } from "@salt-ds/core";
import { ArrowLeftIcon, CartIcon, GithubIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const IconOnly = (): ReactElement => (
  <FlowLayout>
    <Tooltip content="Back to components" placement="top">
      <LinkButton aria-label="Back to components" href="/salt/components">
        <ArrowLeftIcon aria-hidden />
      </LinkButton>
    </Tooltip>
    <Tooltip content="Salt GitHub repository" placement="top">
      <LinkButton
        aria-label="Salt GitHub repository"
        href="https://github.com/jpmorganchase/salt-ds"
      >
        <GithubIcon aria-hidden />
      </LinkButton>
    </Tooltip>
    <Tooltip content="View basket" placement="top">
      <LinkButton aria-label="View basket" href="/basket">
        <CartIcon aria-hidden />
      </LinkButton>
    </Tooltip>
  </FlowLayout>
);
