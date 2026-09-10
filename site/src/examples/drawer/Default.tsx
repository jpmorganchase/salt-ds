import {
  Button,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const Default = (): ReactElement => {
  const [openPrimary, setOpenPrimary] = useState(false);
  const [openSecondary, setOpenSecondary] = useState(false);
  const [openTertiary, setOpenTertiary] = useState(false);

  return (
    <StackLayout>
      <Button onClick={() => setOpenPrimary(true)}>Open Primary Drawer</Button>
      <Drawer
        open={openPrimary}
        onOpenChange={setOpenPrimary}
        style={{ width: 300 }}
      >
        <DrawerHeader
          header="Primary drawer"
          actions={<DrawerCloseButton onClick={() => setOpenPrimary(false)} />}
        />
        <DrawerContent>
          <Text>Primary drawers sit on the container primary background.</Text>
        </DrawerContent>
        <DrawerFooter>
          <Button sentiment="accented" onClick={() => setOpenPrimary(false)}>
            Done
          </Button>
        </DrawerFooter>
      </Drawer>
      <Button onClick={() => setOpenSecondary(true)}>
        Open Secondary Drawer
      </Button>
      <Drawer
        open={openSecondary}
        onOpenChange={setOpenSecondary}
        variant="secondary"
        style={{ width: 300 }}
      >
        <DrawerHeader
          header="Secondary drawer"
          actions={
            <DrawerCloseButton onClick={() => setOpenSecondary(false)} />
          }
        />
        <DrawerContent>
          <Text>
            Secondary drawers sit on the container secondary background.
          </Text>
        </DrawerContent>
        <DrawerFooter>
          <Button sentiment="accented" onClick={() => setOpenSecondary(false)}>
            Done
          </Button>
        </DrawerFooter>
      </Drawer>
      <Button onClick={() => setOpenTertiary(true)}>
        Open Tertiary Drawer
      </Button>
      <Drawer
        open={openTertiary}
        onOpenChange={setOpenTertiary}
        variant="tertiary"
        style={{ width: 300 }}
      >
        <DrawerHeader
          header="Tertiary drawer"
          actions={<DrawerCloseButton onClick={() => setOpenTertiary(false)} />}
        />
        <DrawerContent>
          <Text>
            Tertiary drawers sit on the container tertiary background.
          </Text>
        </DrawerContent>
        <DrawerFooter>
          <Button sentiment="accented" onClick={() => setOpenTertiary(false)}>
            Done
          </Button>
        </DrawerFooter>
      </Drawer>
    </StackLayout>
  );
};
