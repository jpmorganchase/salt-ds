import {
  List,
  ListItem,
  ListItemContent,
  ListItemTrigger,
} from "@salt-ds/core";
import { DocumentIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const ActionItems = (): ReactElement => (
  <List aria-label="Available reports" style={{ maxWidth: 480 }}>
    <ListItem>
      <ListItemTrigger onClick={() => undefined}>
        <ListItemContent>
          <DocumentIcon aria-hidden />
          Generate a new report
        </ListItemContent>
      </ListItemTrigger>
    </ListItem>
    <ListItem>
      <ListItemTrigger href="#quarterly">
        <ListItemContent>
          <DocumentIcon aria-hidden />
          Open quarterly report
        </ListItemContent>
      </ListItemTrigger>
    </ListItem>
    <ListItem>
      <ListItemTrigger href="#annual">
        <ListItemContent>
          <DocumentIcon aria-hidden />
          Open annual report
        </ListItemContent>
      </ListItemTrigger>
    </ListItem>
  </List>
);
