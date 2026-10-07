import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  StackLayout,
  type StackLayoutProps,
  Text,
  useResponsiveProp,
} from "@salt-ds/core";
import { type ElementType, useState } from "react";
import { CloseButton } from "./AnnouncementDialog";

const exampleImage = "/img/examples/exampleImage4x.png";

export const FullImage = () => {
  const [open, setOpen] = useState(false);

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  return (
    <>
      <Button onClick={() => setOpen(true)}>Announcement Trigger</Button>
      <Dialog open={open} onOpenChange={setOpen} style={{ maxWidth: 400 }}>
        <DialogHeader
          preheader="Product update"
          header="New dashboard experience"
          actions={<CloseButton onClick={() => setOpen(false)} />}
          disableAccent
        />
        <DialogContent>
          <StackLayout>
            <Text>
              Experience a completely redesigned dashboard with improved
              navigation, faster loading times, and a cleaner interface that
              helps you focus on what matters most.
            </Text>
            <img alt="" src={exampleImage} />
          </StackLayout>
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
