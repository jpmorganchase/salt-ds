import { List, ListItem, ListItemAction, ListItemContent } from "@salt-ds/core";
import { DocumentIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const ActionItems = (): ReactElement => (
  <List aria-label="Available reports" style={{ maxWidth: 480 }}>
    <ListItem>
      <ListItemAction onClick={() => undefined}>
        <ListItemContent>
          <DocumentIcon aria-hidden />
          Generate a new report
        </ListItemContent>
      </ListItemAction>
    </ListItem>
    <ListItem>
      <ListItemAction href="#quarterly">
        <ListItemContent>
          <DocumentIcon aria-hidden />
          Open quarterly report
        </ListItemContent>
      </ListItemAction>
    </ListItem>
    <ListItem>
      <ListItemAction href="#annual">
        <ListItemContent>
          <DocumentIcon aria-hidden />
          Open annual report
        </ListItemContent>
      </ListItemAction>
    </ListItem>
  </List>
);
