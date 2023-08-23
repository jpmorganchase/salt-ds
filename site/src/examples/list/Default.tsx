import { ListNext } from "@salt-ds/lab";
import { ReactElement } from "react";
import { getListItems } from "./exampleData";

export const Default = (): ReactElement => {
  return (
    <ListNext
      aria-label="Declarative List example"
      style={{ height: "150px" }}
      onChange={(e, { value }) => {
        console.log("new selection", value);
      }}
    >
      {getListItems({
        disabledItems: [1, 5],
      })}
    </ListNext>
  );
};
