import { Pill } from "@salt-ds/core";
import { FavoriteIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

const handleClick = () => {
  console.log("clicked");
};

export const Icon = (): ReactElement => (
  <Pill onClick={handleClick}>
    <FavoriteIcon aria-hidden /> Pill with Icon
  </Pill>
);
