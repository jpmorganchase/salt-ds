import {
  Button,
  Overlay,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
  Text,
  Tooltip,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const Default = (): ReactElement => {
  return (
    <Overlay>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel>
        <OverlayHeader header="Title" />
        <OverlayPanelContent>
          <StackLayout gap={1}>
            <Text as="p">Content of Overlay</Text>
            <Tooltip content="I'm a tooltip">
              <Button>hover me</Button>
            </Tooltip>
          </StackLayout>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
