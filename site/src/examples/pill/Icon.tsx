import { ReactElement } from "react";
import { Pill } from "@salt-ds/core";
import { FavoriteIcon } from "@salt-ds/icons";

const handleClick = () => {
  console.log("clicked");
};

export const Icon = (): ReactElement => (
  <Pill onClick={handleClick}>
    <FavoriteIcon /> Pill with Icon
  </Pill>
);
