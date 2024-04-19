import { ReactElement, useState } from "react";
import { Card } from "@salt-ds/core";
import { Menu, MenuItem, MenuPanel } from "@salt-ds/lab";
import { VirtualElement as FloatingUIVirtualElement } from "@floating-ui/react";

export const VirtualElement = (): ReactElement => {
  const [virtualElement, setVirtualElement] =
    useState<FloatingUIVirtualElement | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card
        style={{
          width: 300,
          aspectRatio: 2 / 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          setVirtualElement({
            getBoundingClientRect: () => ({
              width: 0,
              height: 0,
              x: event.clientX,
              y: event.clientY,
              top: event.clientY,
              right: event.clientX,
              bottom: event.clientY,
              left: event.clientX,
            }),
          });
          setOpen(true);
        }}
      >
        Right click here
      </Card>
      <Menu
        getVirtualElement={() => virtualElement}
        open={open}
        onOpenChange={setOpen}
      >
        <MenuPanel>
          <MenuItem>Copy</MenuItem>
          <MenuItem>Move</MenuItem>
          <MenuItem>Delete</MenuItem>
        </MenuPanel>
      </Menu>
    </>
  );
};
