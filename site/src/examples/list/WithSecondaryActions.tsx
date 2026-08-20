import {
  Button,
  List,
  ListItem,
  ListItemActions,
  ListItemContent,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const WithSecondaryActions = (): ReactElement => (
  <List aria-label="Recent reports" style={{ maxWidth: 480 }}>
    <ListItem>
      <ListItemContent>Quarterly report</ListItemContent>
      <ListItemActions>
        <Button appearance="transparent">Download</Button>
      </ListItemActions>
    </ListItem>
    <ListItem>
      <ListItemContent>Annual report</ListItemContent>
      <ListItemActions aria-label="Annual report actions" role="group">
        <Button appearance="transparent">Download</Button>
        <Button appearance="transparent">Delete</Button>
      </ListItemActions>
    </ListItem>
  </List>
);
