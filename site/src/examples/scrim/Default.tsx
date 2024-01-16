import { ReactElement, useState } from "react";
import { Scrim } from "@salt-ds/lab";
import { Button, Card, H3, Text } from "@salt-ds/core";

export const Default = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Card style={{ position: "relative", width: "256px" }}>
      <H3>Sustainable investing products</H3>
      <Text>
        We have a commitment to provide a wide range of investment solutions to
        enable you to align your financial goals to your values.
      </Text>
      <Button onClick={handleOpen}>Click to open scrim</Button>
      <Scrim open={open}>
        <Button onClick={handleClose}>Click to close scrim</Button>
      </Scrim>
    </Card>
  );
};
