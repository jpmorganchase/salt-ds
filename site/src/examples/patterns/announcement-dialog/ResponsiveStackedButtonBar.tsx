import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexItem,
  FlexLayout,
  SplitLayout,
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

export const ResponsiveStackedButtonBar = () => {
  const [open, setOpen] = useState(false);

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  const remindMeLater = (
    <FlexItem>
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={() => setOpen(false)}
        style={{ width: "100%" }}
      >
        Remind me later
      </Button>
    </FlexItem>
  );

  const goToDashboard = (
    <FlexItem>
      <Button
        sentiment="accented"
        appearance="bordered"
        onClick={() => setOpen(false)}
        style={{ width: "100%" }}
      >
        Go to dashboard
      </Button>
    </FlexItem>
  );

  const tryItNow = (
    <FlexItem>
      <Button
        sentiment="accented"
        onClick={() => setOpen(false)}
        style={{ width: "100%" }}
      >
        Try it now
      </Button>
    </FlexItem>
  );

  return (
    <>
      <Button onClick={() => setOpen(true)}>Announcement Trigger</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader
          preheader="Product update"
          header="Change the viewport to see how the buttons stack"
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
          {direction === "column" ? (
            <StackLayout gap={1} style={{ width: "100%" }}>
              {tryItNow}
              {goToDashboard}
              {remindMeLater}
            </StackLayout>
          ) : (
            <SplitLayout
              startItem={remindMeLater}
              endItem={
                <StackLayout direction="row" gap={1}>
                  {goToDashboard}
                  {tryItNow}
                </StackLayout>
              }
            />
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
