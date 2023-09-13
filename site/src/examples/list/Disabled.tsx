import { ListNext } from "@salt-ds/lab";
import { ReactElement } from "react";
import { getListItems } from "./exampleData";

export const Disabled = (): ReactElement => {
  return (
    <ListNext
      aria-label="Disabled List example"
      style={{ height: "150px" }}
      disabled
    >
      {getListItems({})}
    </ListNext>
  );
};
