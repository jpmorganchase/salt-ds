import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexItem,
  FlexLayout,
  H3,
  StackLayout,
  type StackLayoutProps,
  Text,
  useResponsiveProp,
} from "@salt-ds/core";
import { type ElementType, useState } from "react";
import { CloseButton } from "./AnnouncementDialog";
import importedStyles from "./example.module.css";

const exampleImage = "/img/examples/exampleImage4x.png";

const styles = importedStyles as unknown as Record<string, string>;

export const ContentScrolling = () => {
  const [open, setOpen] = useState(false);

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  return (
    <>
      <Button onClick={() => setOpen(true)}>Announcement Trigger</Button>
      <Dialog open={open} onOpenChange={setOpen} style={{ maxHeight: 420 }}>
        <DialogHeader
          preheader="Major update"
          header="What's new in version 3.0"
          actions={<CloseButton onClick={() => setOpen(false)} />}
          disableAccent
        />
        <DialogContent>
          <FlexLayout direction={{ xs: "column", sm: "row" }}>
            <FlexItem grow={1} basis="50%" style={{ minWidth: 0 }}>
              <StackLayout gap={1}>
                <H3>Analytics engine</H3>
                <Text>
                  The new analytics engine processes data up to 10x faster than
                  before, enabling real-time insights that help you make
                  informed decisions quickly. With our improved visualization
                  tools, you can create stunning charts that communicate complex
                  information.
                </Text>
                <H3>Collaboration features</H3>
                <Text>
                  Share insights seamlessly across your organization with
                  enhanced collaboration tools. Team members can annotate data,
                  create shared workspaces, and receive real-time notifications
                  when important metrics change. Export capabilities support
                  multiple formats including PDF, Excel, and interactive web
                  reports. Version control ensures everyone works with the most
                  up-to-date information.
                </Text>
                <H3>Security &amp; compliance</H3>
                <Text>
                  Enhanced security protocols and compliance certifications
                  ensure your data remains protected and meets industry
                  standards.
                </Text>
                <H3>Performance &amp; reliability</H3>
                <Text>
                  Faster load times and fewer outages keep your team productive.
                  We maintain high availability and optimize resource use across
                  all environments.
                </Text>
                <H3>Accessibility &amp; theming</H3>
                <Text>
                  Built-in support for screen readers, keyboard navigation, and
                  high-contrast modes. Customize colors, density, and layout to
                  match your brand and user needs.
                </Text>
              </StackLayout>
            </FlexItem>
            <FlexItem
              grow={1}
              basis="50%"
              align="start"
              style={{ minWidth: 0 }}
            >
              <img
                alt=""
                src={exampleImage}
                className={styles.announcementImage}
              />
            </FlexItem>
          </FlexLayout>
        </DialogContent>
        <DialogActions>
          <Button
            sentiment="accented"
            onClick={() => setOpen(false)}
            style={direction === "column" ? { width: "100%" } : undefined}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
