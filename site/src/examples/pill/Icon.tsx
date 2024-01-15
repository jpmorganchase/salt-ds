import { ReactElement } from "react";
import { PillNext } from "@salt-ds/lab";
import { FavoriteIcon } from "@salt-ds/icons";

const handleClick = () => {
  console.log("clicked");
};

export const Icon = (): ReactElement => (
  <PillNext onClick={handleClick}>
    <FavoriteIcon /> Pill with Icon
  </PillNext>
);
