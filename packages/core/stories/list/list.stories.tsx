import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  Link,
  List,
  ListItem,
  ListItemContent,
  ListItemTrigger,
  Overlay,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
  useId,
} from "@salt-ds/core";
import { CloseIcon, DocumentIcon, DownloadIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";
import { MemoryRouter, Link as RouterLink } from "react-router";

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

export const StaticContent: StoryFn = () => (
  <List aria-label="Reports">
    <ListItem>
      <ListItemContent>Quarterly report</ListItemContent>
    </ListItem>
    <ListItem>
      <ListItemContent>Annual report</ListItemContent>
    </ListItem>
    <ListItem>
      <ListItemContent>Monthly performance report</ListItemContent>
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
      <Button appearance="transparent" aria-label="Download quarterly report">
        <DownloadIcon aria-hidden />
      </Button>
    </ListItem>
    <ListItem>
      <ListItemContent>
        <DocumentIcon aria-hidden />
        Annual report
      </ListItemContent>
      <Button appearance="transparent" aria-label="Download annual report">
        <DownloadIcon aria-hidden />
      </Button>
    </ListItem>
    <ListItem>
      <ListItemContent>
        <DocumentIcon aria-hidden />
        Monthly performance report
      </ListItemContent>
      <Button
        appearance="transparent"
        aria-label="Download monthly performance report"
      >
        <DownloadIcon aria-hidden />
      </Button>
    </ListItem>
  </List>
);

export const ActionItems: StoryFn = () => (
  <List aria-label="Available reports">
    <ListItem>
      <ListItemTrigger onClick={() => undefined}>
        <ListItemContent>
          <DocumentIcon aria-hidden />
          Generate a new report
        </ListItemContent>
      </ListItemTrigger>
    </ListItem>
    <ListItem>
      <ListItemTrigger href="#quarterly" onClick={preventNavigation}>
        <ListItemContent>
          <DocumentIcon aria-hidden />
          Open quarterly report
        </ListItemContent>
      </ListItemTrigger>
    </ListItem>
    <ListItem>
      <ListItemTrigger disabled>
        <ListItemContent>Unavailable report</ListItemContent>
      </ListItemTrigger>
    </ListItem>
  </List>
);

export const Ordered: StoryFn = () => (
  <List render={<ol />} aria-label="Report preparation steps">
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
      <Button appearance="transparent" aria-label="Download quarterly report">
        <DownloadIcon aria-hidden />
      </Button>
    </ListItem>
  </List>
);

export const RoutingLibraries: StoryFn = () => (
  <MemoryRouter>
    <nav aria-label="Report links">
      <List>
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
            href="https://example.com/report"
            render={<Link rel="noopener" target="_blank" />}
          >
            <ListItemContent>External report</ListItemContent>
          </ListItemTrigger>
        </ListItem>
      </List>
    </nav>
  </MemoryRouter>
);

export const InDialog: StoryFn = () => {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  const closeButton = (
    <Button
      aria-label="Close dialog"
      appearance="transparent"
      onClick={handleClose}
    >
      <CloseIcon aria-hidden />
    </Button>
  );

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open reports</Button>
      <Dialog open={open} onOpenChange={setOpen} size="small">
        <DialogHeader header="Reports" actions={closeButton} />
        <DialogContent>
          <List aria-label="Reports">
            <ListItem>
              <ListItemTrigger>
                <ListItemContent>Quarterly report</ListItemContent>
              </ListItemTrigger>
            </ListItem>
            <ListItem>
              <ListItemTrigger>
                <ListItemContent>Annual report</ListItemContent>
              </ListItemTrigger>
            </ListItem>
            <ListItem>
              <ListItemTrigger>
                <ListItemContent>Monthly performance report</ListItemContent>
              </ListItemTrigger>
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const InOverlay: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const headerId = useId();

  const handleClose = () => setOpen(false);

  const closeButton = (
    <Button
      aria-label="Close overlay"
      appearance="transparent"
      onClick={handleClose}
    >
      <CloseIcon aria-hidden />
    </Button>
  );

  return (
    <Overlay open={open} onOpenChange={setOpen} placement="bottom">
      <OverlayTrigger>
        <Button>Show reports</Button>
      </OverlayTrigger>
      <OverlayPanel aria-labelledby={headerId}>
        <OverlayHeader header="Reports" actions={closeButton} id={headerId} />
        <OverlayPanelContent>
          <StackLayout gap={1} style={{ width: 320 }}>
            <List aria-label="Reports">
              <ListItem>
                <ListItemTrigger>
                  <ListItemContent>Quarterly report</ListItemContent>
                </ListItemTrigger>
              </ListItem>
              <ListItem>
                <ListItemTrigger>
                  <ListItemContent>Annual report</ListItemContent>
                </ListItemTrigger>
              </ListItem>
              <ListItem>
                <ListItemTrigger>
                  <ListItemContent>
                    Monthly report with a title that wraps in the narrow panel
                  </ListItemContent>
                </ListItemTrigger>
              </ListItem>
            </List>
          </StackLayout>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
