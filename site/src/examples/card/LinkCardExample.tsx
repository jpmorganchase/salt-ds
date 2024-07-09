import { LinkCard } from "@salt-ds/core";
import type { ReactElement } from "react";

export const LinkCardExample = (): ReactElement => {
  return (
    <LinkCard
      href="https://www.saltdesignsystem.com"
      target="_blank"
      style={{ width: "260px", height: "144px" }}
      accent="top"
    />
  );
};
