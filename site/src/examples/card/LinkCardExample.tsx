import { ReactElement } from "react";
import { LinkCard } from "@salt-ds/lab";

export const LinkCardExample = (): ReactElement => {
  return (
    <LinkCard
      href="https://www.saltdesignsystem.com"
      target="_blank"
      style={{ width: "260px", height: "144px" }}
      accent="top"
    >contents<div>contents of contents<text>inside</text></div></LinkCard>
  );
};
