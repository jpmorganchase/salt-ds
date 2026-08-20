import {
  Link,
  List,
  ListItem,
  ListItemAction,
  ListItemContent,
} from "@salt-ds/core";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
} from "react";

const RouterLink = forwardRef<
  HTMLAnchorElement,
  Omit<ComponentPropsWithoutRef<"a">, "href"> & { to: string }
>(function RouterLink({ to, ...rest }, ref) {
  return <a {...rest} href={to} ref={ref} />;
});

export const RoutingLibraries = (): ReactElement => (
  <List aria-label="Report links" style={{ maxWidth: 420 }}>
    <ListItem>
      <ListItemAction
        href="/reports/quarterly"
        render={<RouterLink to="/reports/quarterly" />}
      >
        <ListItemContent>JSX router link</ListItemContent>
      </ListItemAction>
    </ListItem>
    <ListItem>
      <ListItemAction
        href="/reports/annual"
        render={({ href, ...props }) => <RouterLink {...props} to={href} />}
      >
        <ListItemContent>Callback router link</ListItemContent>
      </ListItemAction>
    </ListItem>
    <ListItem>
      <ListItemAction
        href="https://example.com/reports"
        render={<Link target="_blank" />}
      >
        <ListItemContent>External reports</ListItemContent>
      </ListItemAction>
    </ListItem>
  </List>
);
