import { ReactElement } from "react";
import { StackLayout, Link } from "@salt-ds/core";
import { GithubIcon } from "@salt-ds/icons";

export const OpenInANewTab = (): ReactElement => (
  <StackLayout>
    <Link
      href="https://www.saltdesignsystem.com"
      target="_blank"
      rel="noopener"
    >
      Opens in a new tab
    </Link>
    <Link
      href="https://github.com/jpmorganchase/salt-ds"
      target="_blank"
      rel="noopener"
      IconComponent={GithubIcon}
    >
      Salt GitHub repository
    </Link>
    <Link href="#" target="_blank" rel="noopener" IconComponent={null}>
      This link has no icon
    </Link>
  </StackLayout>
);
