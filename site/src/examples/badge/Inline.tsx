import { ReactElement } from "react";
import { Badge, List, ListItem } from "@salt-ds/lab";

export const Inline = (): ReactElement => (
  <List aria-label="Declarative List example">
    <ListItem>Level 1</ListItem>
    <ListItem>Level 2</ListItem>
    <ListItem>Level 3</ListItem>
    <ListItem>
      Level 4<Badge value={"NEW"} />{" "}
    </ListItem>
  </List>
);
