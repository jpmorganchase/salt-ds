import { List, ListItem, ListItemContent } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Default = (): ReactElement => (
  <List aria-label="Recent reports" style={{ maxWidth: 420 }}>
    <ListItem>
      <ListItemContent>Quarterly report</ListItemContent>
    </ListItem>
    <ListItem>
      <ListItemContent>
        Annual report with a longer title that can wrap onto another line
      </ListItemContent>
    </ListItem>
  </List>
);
