import {
  Button,
  Dialog,
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
  OverlayPanelContent,
  OverlayTrigger,
} from "@salt-ds/core";
import {
  AddUserIcon,
  DeleteIcon,
  DocumentIcon,
  DownloadIcon,
  OverflowMenuIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/List/List QA",
  component: List,
} as Meta<typeof List>;

const preventNavigation = (event: { preventDefault: () => void }) =>
  event.preventDefault();

const ListMatrix = ({ direction = "ltr" }: { direction?: "ltr" | "rtl" }) => (
  <div dir={direction} style={{ width: 320 }}>
    <List aria-label={`${direction} reports`}>
      <ListItem>
        <ListItemContent>Static content</ListItemContent>
      </ListItem>
      <ListItem>
        <ListItemContent>
          <DocumentIcon aria-hidden />
          Static content with one action
        </ListItemContent>
        <ListItemActions>
          <Button appearance="transparent" aria-label="Download static report">
            <DownloadIcon aria-hidden />
          </Button>
        </ListItemActions>
      </ListItem>
      <ListItem>
        <ListItemAction>
          <ListItemContent>
            <DocumentIcon aria-hidden />
            <span>
              A button item with text long enough to wrap across three lines at
              this width and prove first-line alignment.
            </span>
          </ListItemContent>
        </ListItemAction>
        <ListItemActions aria-label="Button item actions" role="group">
          <Button appearance="transparent" aria-label="Download button report">
            <DownloadIcon aria-hidden />
          </Button>
          <Button appearance="transparent" aria-label="Delete button report">
            <DeleteIcon aria-hidden />
          </Button>
        </ListItemActions>
      </ListItem>
      <ListItem>
        <ListItemAction href="#linked-report" onClick={preventNavigation}>
          <ListItemContent>Linked report</ListItemContent>
        </ListItemAction>
        <ListItemActions>
          <Button appearance="transparent" aria-label="Download linked report">
            <DownloadIcon aria-hidden />
          </Button>
        </ListItemActions>
      </ListItem>
      <ListItem>
        <ListItemAction
          href="https://example.com/reports"
          render={<Link rel="noopener" target="_blank" />}
        >
          <ListItemContent>External report</ListItemContent>
        </ListItemAction>
      </ListItem>
      <ListItem>
        <ListItemAction disabled>
          <ListItemContent>Disabled primary button</ListItemContent>
        </ListItemAction>
        <ListItemActions>
          <Button
            appearance="transparent"
            aria-label="Request access to disabled primary button"
          >
            <AddUserIcon aria-hidden />
          </Button>
        </ListItemActions>
      </ListItem>
      <ListItem>
        <ListItemContent>
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Truncated report name that is deliberately much wider than the row
          </span>
        </ListItemContent>
        <ListItemActions>
          <Button
            appearance="transparent"
            aria-label="More truncated report actions"
          >
            <OverflowMenuIcon aria-hidden />
          </Button>
        </ListItemActions>
      </ListItem>
    </List>
  </div>
);

export const AllCompositions: StoryFn<QAContainerProps> = () => (
  <QAContainer itemWidthAuto transposeDensity vertical height="auto">
    <ListMatrix />
  </QAContainer>
);
AllCompositions.parameters = {
  chromatic: { disableSnapshot: false },
  docs: {
    description: {
      story:
        "Use keyboard and pointer interaction to inspect hover, active, and focus-visible states. Forced-colors and 200% zoom remain manual checks.",
    },
  },
};

export const RightToLeft: StoryFn<QAContainerProps> = () => (
  <QAContainer itemWidthAuto transposeDensity vertical height="auto">
    <ListMatrix direction="rtl" />
  </QAContainer>
);
RightToLeft.parameters = {
  chromatic: { disableSnapshot: false },
};

export const NarrowDialog: StoryFn<QAContainerProps> = () => (
  <QAContainer densities={["medium"]} itemWidthAuto vertical height={640}>
    <div style={{ height: 560, width: 360 }}>
      <Dialog open size="small">
        <DialogHeader header="Dialog reports" />
        <DialogContent>
          <ListMatrix />
        </DialogContent>
      </Dialog>
    </div>
  </QAContainer>
);
NarrowDialog.parameters = {
  chromatic: { disableSnapshot: false },
};

export const NarrowOverlay: StoryFn<QAContainerProps> = () => (
  <QAContainer densities={["medium"]} itemWidthAuto vertical height={640}>
    <div style={{ height: 560, width: 360 }}>
      <Overlay open placement="bottom">
        <OverlayTrigger>
          <Button>Show overlay reports</Button>
        </OverlayTrigger>
        <OverlayPanel>
          <OverlayPanelContent>
            <ListMatrix />
          </OverlayPanelContent>
        </OverlayPanel>
      </Overlay>
    </div>
  </QAContainer>
);
NarrowOverlay.parameters = {
  chromatic: { disableSnapshot: false },
};
