import {
  Button,
  List,
  ListItem,
  ListItemActions,
  ListItemContent,
} from "@salt-ds/core";
import { DocumentIcon, DownloadIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const WithSecondaryActions = (): ReactElement => (
  <List aria-label="Recent reports" style={{ maxWidth: 480 }}>
    <ListItem>
      <ListItemContent>
        <DocumentIcon aria-hidden />
        Quarterly report
      </ListItemContent>
      <ListItemActions>
        <Button appearance="transparent" aria-label="Download quarterly report">
          <DownloadIcon aria-hidden />
        </Button>
      </ListItemActions>
    </ListItem>
    <ListItem>
      <ListItemContent>
        <DocumentIcon aria-hidden />
        Annual report
      </ListItemContent>
      <ListItemActions>
        <Button appearance="transparent" aria-label="Download annual report">
          <DownloadIcon aria-hidden />
        </Button>
      </ListItemActions>
    </ListItem>
    <ListItem>
      <ListItemContent>
        <DocumentIcon aria-hidden />
        Monthly performance report
      </ListItemContent>
      <ListItemActions>
        <Button
          appearance="transparent"
          aria-label="Download monthly performance report"
        >
          <DownloadIcon aria-hidden />
        </Button>
      </ListItemActions>
    </ListItem>
  </List>
);
