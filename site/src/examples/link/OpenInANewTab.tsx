import { ReactElement } from "react";
import { StackLayout, Link } from "@salt-ds/core";
import { GithubIcon } from "@salt-ds/icons";

export const OpenInANewTab = (): ReactElement => (
  <StackLayout>
    <p>
      Using default icon:{" "}
      <Link
        href="https://www.saltdesignsystem.com"
        target="_blank"
        rel="noopener"
      >
        Open the Salt website in a new tab
      </Link>
    </p>
    <p>
      Using a custom icon:{" "}
      <Link
        href="https://github.com/jpmorganchase/salt-ds"
        target="_blank"
        rel="noopener"
        IconComponent={GithubIcon}
      >
        Open the Salt GitHub repository in a new tab
      </Link>
    </p>
    <p>
      With the icon removed:{" "}
      <Link href="" target="_blank" rel="noopener" IconComponent={null}>
        Open this page in a new tab
      </Link>
    </p>
  </StackLayout>
);
