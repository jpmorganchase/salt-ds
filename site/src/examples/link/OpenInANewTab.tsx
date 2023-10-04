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
      Default icon
    </Link>

    <Link
      href="https://github.com/jpmorganchase/salt-ds"
      target="_blank"
      rel="noopener"
      IconComponent={GithubIcon}
    >
      Custom icon
    </Link>

    <Link href="" target="_blank" rel="noopener" IconComponent={null}>
      Icon removed
    </Link>
  </StackLayout>
);
