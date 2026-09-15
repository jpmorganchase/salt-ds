import {
  Button,
  H3,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
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
          <StackLayout gap={0.5}>
            <H3 id={id}>
              <strong>Title</strong>
            </H3>
            <Text>Content of Overlay</Text>
          </StackLayout>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
