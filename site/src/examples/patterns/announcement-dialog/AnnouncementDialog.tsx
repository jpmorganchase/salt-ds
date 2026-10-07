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
import { CloseIcon } from "@salt-ds/icons";
import { type ElementType, useState } from "react";
import importedStyles from "./example.module.css";

const exampleImage = "/img/examples/exampleImage4x.png";

const styles = importedStyles as unknown as Record<string, string>;

export const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <Button aria-label="Close" appearance="transparent" onClick={onClick}>
    <CloseIcon aria-hidden />
  </Button>
);

export const AnnouncementDialog = () => {
  const [open, setOpen] = useState(false);

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  return (
    <>
      <Button onClick={() => setOpen(true)}>Announcement Trigger</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader
          preheader="New feature"
          header="Trade across markets"
          actions={<CloseButton onClick={() => setOpen(false)} />}
          disableAccent
        />
        <DialogContent>
          <FlexLayout direction={{ xs: "column", sm: "row" }}>
            <FlexItem grow={1} basis="50%" style={{ minWidth: 0 }}>
              <StackLayout gap={1}>
                <H3>Builder</H3>
                <Text>
                  Create your own optimized corporate bond portfolios targeting
                  specific characteristics using a wide range of parameters and
                  constraints including Yield, Risk, churn, costs and more.
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
            style={direction === "column" ? { width: "100%" } : undefined}
            onClick={() => setOpen(false)}
          >
            Try it now
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
