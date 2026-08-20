import {
  Button,
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogHeader,
  Link,
  List,
  ListItem,
  ListItemAction,
  ListItemActions,
  ListItemContent,
  Overlay,
  OverlayPanel,
  OverlayPanelCloseButton,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
} from "@salt-ds/core";
import { DeleteIcon, DocumentIcon, DownloadIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type ComponentPropsWithoutRef, forwardRef, useState } from "react";

export default {
  title: "Core/List",
  component: List,
  decorators: [
    (Story: StoryFn) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} as Meta<typeof List>;

const preventNavigation = (event: { preventDefault: () => void }) =>
  event.preventDefault();

const RouterLink = forwardRef<
  HTMLAnchorElement,
  Omit<ComponentPropsWithoutRef<"a">, "href"> & { to: string }
>(function RouterLink({ to, ...rest }, ref) {
  return <a {...rest} href={to} ref={ref} />;
});

export const PassiveContent: StoryFn = () => (
  <List aria-label="Reports">
    <ListItem>
      <ListItemContent>Quarterly report</ListItemContent>
    </ListItem>
    <ListItem>
      <ListItemContent>Annual report</ListItemContent>
    </ListItem>
  </List>
);

export const WithSecondaryActions: StoryFn = () => (
  <List aria-label="Reports">
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
      <ListItemActions aria-label="Annual report actions" role="group">
        <Button appearance="transparent" aria-label="Download annual report">
          <DownloadIcon aria-hidden />
        </Button>
        <Button appearance="transparent" aria-label="Delete annual report">
          <DeleteIcon aria-hidden />
        </Button>
      </ListItemActions>
    </ListItem>
  </List>
);

export const ActionItems: StoryFn = () => (
  <List aria-label="Available reports">
    <ListItem>
      <ListItemAction onClick={() => undefined}>
        <ListItemContent>
          <DocumentIcon aria-hidden />
          Generate a new report
        </ListItemContent>
      </ListItemAction>
      <ListItemActions>
        <Button
          appearance="transparent"
          aria-label="Report generation options"
        />
      </ListItemActions>
    </ListItem>
    <ListItem>
      <ListItemAction href="#quarterly" onClick={preventNavigation}>
        <ListItemContent>
          <DocumentIcon aria-hidden />
          Open quarterly report
        </ListItemContent>
      </ListItemAction>
      <ListItemActions>
        <Button appearance="transparent" aria-label="Download quarterly report">
          <DownloadIcon aria-hidden />
        </Button>
      </ListItemActions>
    </ListItem>
    <ListItem>
      <ListItemAction disabled>
        <ListItemContent>Unavailable report</ListItemContent>
      </ListItemAction>
      <ListItemActions>
        <Button appearance="transparent">Request access</Button>
      </ListItemActions>
    </ListItem>
  </List>
);

export const Ordered: StoryFn = () => (
  <List as="ol" aria-label="Report preparation steps">
    <ListItem>
      <ListItemContent>Choose a reporting period</ListItemContent>
    </ListItem>
    <ListItem>
      <ListItemContent>Select the required data</ListItemContent>
    </ListItem>
    <ListItem>
      <ListItemContent>Generate the report</ListItemContent>
    </ListItem>
  </List>
);

export const MultilineContent: StoryFn = () => (
  <List aria-label="Reports" style={{ maxWidth: 320 }}>
    <ListItem>
      <ListItemAction>
        <ListItemContent>
          <DocumentIcon aria-hidden />
          <span>
            <span style={{ display: "block" }}>Quarterly report</span>
            <span style={{ display: "block" }}>
              A longer description wraps below the first line while the icon and
              trailing action remain aligned with that first line.
            </span>
          </span>
        </ListItemContent>
      </ListItemAction>
      <ListItemActions>
        <Button appearance="transparent" aria-label="Download quarterly report">
          <DownloadIcon aria-hidden />
        </Button>
      </ListItemActions>
    </ListItem>
  </List>
);

export const RoutingLibraries: StoryFn = () => (
  <List aria-label="Reports">
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
        href="https://example.com/report"
        render={<Link target="_blank" />}
      >
        <ListItemContent>External report</ListItemContent>
      </ListItemAction>
    </ListItem>
  </List>
);

export const InDialog: StoryFn = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open reports</Button>
      <Dialog open={open} onOpenChange={setOpen} size="small">
        <DialogHeader header="Reports" actions={<DialogCloseButton />} />
        <DialogContent>
          <List aria-label="Reports">
            <ListItem>
              <ListItemAction>
                <ListItemContent>Quarterly report</ListItemContent>
              </ListItemAction>
              <ListItemActions>
                <Button aria-label="Download quarterly report">
                  <DownloadIcon aria-hidden />
                </Button>
              </ListItemActions>
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const InOverlay: StoryFn = () => {
  const [open, setOpen] = useState(false);

  return (
    <Overlay open={open} onOpenChange={setOpen} placement="bottom">
      <OverlayTrigger>
        <Button>Show reports</Button>
      </OverlayTrigger>
      <OverlayPanel>
        <OverlayPanelCloseButton />
        <OverlayPanelContent>
          <StackLayout gap={1} style={{ width: 320 }}>
            <List aria-label="Reports">
              <ListItem>
                <ListItemAction>
                  <ListItemContent>Quarterly report</ListItemContent>
                </ListItemAction>
                <ListItemActions>
                  <Button aria-label="Download quarterly report">
                    <DownloadIcon aria-hidden />
                  </Button>
                </ListItemActions>
              </ListItem>
            </List>
          </StackLayout>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
