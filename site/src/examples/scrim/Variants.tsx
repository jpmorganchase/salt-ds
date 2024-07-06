import { ReactElement, useState } from "react";
import { Button, Scrim, Text, StackLayout } from "@salt-ds/core";

export const Variants = (): ReactElement => {
  const [openPrimary, setOpenPrimary] = useState(false);
  const [openSecondary, setOpenSecondary] = useState(false);

  const handleOpenPrimary = () => {
    setOpenPrimary(true);
  };

  const handleClosePrimary = () => {
    setOpenPrimary(false);
  };

  const handleOpenSecondary = () => {
    setOpenSecondary(true);
  };

  const handleCloseSecondary = () => {
    setOpenSecondary(false);
  };

  return (
    <StackLayout direction="row">
      <Scrim
        fixed
        open={openPrimary}
        variant={"primary"}
        onClick={handleClosePrimary}
      >
        <Text>
          <strong>Click scrim to close</strong>
        </Text>
      </Scrim>
      <Button onClick={handleOpenPrimary} variant="primary">
        Show primary scrim
      </Button>
      <Scrim
        fixed
        open={openSecondary}
        variant={"secondary"}
        onClick={handleCloseSecondary}
      >
        <Text>
          <strong>Click scrim to close</strong>
        </Text>
      </Scrim>
      <Button onClick={handleOpenSecondary} variant="secondary">
        Show secondary scrim
      </Button>
    </StackLayout>
  );
};
