import {
  Button,
  H3,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  Text,
  useId,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const HideArrow = (): ReactElement => {
  const id = useId();
  return (
    <Overlay placement="bottom" hideArrow>
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
          <Text>Content of Overlay</Text>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
