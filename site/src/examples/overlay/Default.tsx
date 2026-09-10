import {
  Button,
  H3,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
  Text,
  Tooltip,
  useId,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const Default = (): ReactElement => {
  const id = useId();
  return (
    <Overlay>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel aria-labelledby={id}>
        <OverlayPanelContent>
          <H3
            id={id}
            style={{ margin: 0, marginBottom: "var(--salt-spacing-100)" }}
          >
            Title
          </H3>
          <StackLayout gap={1}>
            <Text>Content of Overlay</Text>
            <Tooltip content="I'm a tooltip">
              <Button>hover me</Button>
            </Tooltip>
          </StackLayout>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
