import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexItem,
  FlexLayout,
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

export const ResponsiveStackedContent = () => {
  const [open, setOpen] = useState(false);

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  return (
    <>
      <Button onClick={() => setOpen(true)}>Announcement Trigger</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader
          preheader="Product update"
          header="Change the viewport to see how the content stacks"
          actions={<CloseButton onClick={() => setOpen(false)} />}
          disableAccent
        />
        <DialogContent>
          <FlexLayout direction={{ xs: "column", sm: "row" }}>
            <FlexItem grow={1} basis="50%" style={{ minWidth: 0 }}>
              <StackLayout gap={1}>
                <Text>
                  We're excited to announce a powerful new analytics dashboard
                  that helps you visualize your data in real-time.
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
            Try it now
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
