import { ReactElement } from "react";
import { PillNext } from "@salt-ds/lab";
import { FavoriteIcon } from "@salt-ds/icons";

const handleClick = () => {
  console.log("clicked");
};

export const Icon = (): ReactElement => (
  <PillNext icon={<FavoriteIcon />} onClick={handleClick}>
    Pill with Icon
  </PillNext>
);
