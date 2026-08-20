import {
  Button,
  List,
  ListItem,
  ListItemAction,
  ListItemActions,
  ListItemContent,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const ActionItems = (): ReactElement => (
  <List aria-label="Available reports" style={{ maxWidth: 480 }}>
    <ListItem>
      <ListItemAction onClick={() => undefined}>
        <ListItemContent>Generate a new report</ListItemContent>
      </ListItemAction>
      <ListItemActions>
        <Button appearance="transparent" aria-label="Report options">
          Options
        </Button>
      </ListItemActions>
    </ListItem>
    <ListItem>
      <ListItemAction href="#quarterly">
        <ListItemContent>Open quarterly report</ListItemContent>
      </ListItemAction>
      <ListItemActions>
        <Button appearance="transparent" aria-label="Download quarterly report">
          Download
        </Button>
      </ListItemActions>
    </ListItem>
  </List>
);
