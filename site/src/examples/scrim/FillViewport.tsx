import { ReactElement, useState } from "react";
import { Button, Scrim, Text } from "@salt-ds/core";

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
      <Button onClick={handleOpen} variant="cta">
        Show scrim
      </Button>
    </>
  );
};
