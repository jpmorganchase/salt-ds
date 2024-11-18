import { Button, Scrim, Text } from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const FillViewport = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Scrim fixed open={open} onClick={handleClose}>
        <Text>
          <strong>Click scrim to close</strong>
        </Text>
      </Scrim>
      <Button onClick={handleOpen} sentiment="accented">
        Show scrim
      </Button>
    </>
  );
};
