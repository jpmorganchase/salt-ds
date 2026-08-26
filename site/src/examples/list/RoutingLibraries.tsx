import {
  Link,
  List,
  ListItem,
  ListItemContent,
  ListItemTrigger,
} from "@salt-ds/core";
import type { ReactElement } from "react";
import { MemoryRouter, Link as RouterLink } from "react-router";

export const RoutingLibraries = (): ReactElement => (
  <MemoryRouter>
    <nav aria-label="Report links">
      <List style={{ maxWidth: 420 }}>
        <ListItem>
          <ListItemTrigger
            href="/reports/quarterly"
            render={<RouterLink to="/reports/quarterly" />}
          >
            <ListItemContent>Quarterly report</ListItemContent>
          </ListItemTrigger>
        </ListItem>
        <ListItem>
          <ListItemTrigger
            href="/reports/annual"
            render={({ href, ...props }) => <RouterLink {...props} to={href} />}
          >
            <ListItemContent>Annual report</ListItemContent>
          </ListItemTrigger>
        </ListItem>
        <ListItem>
          <ListItemTrigger
            href="https://example.com/reports"
            render={<Link rel="noopener" target="_blank" />}
          >
            <ListItemContent>External reports</ListItemContent>
          </ListItemTrigger>
        </ListItem>
      </List>
    </nav>
  </MemoryRouter>
);
