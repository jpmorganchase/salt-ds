import {
  Button,
  Overlay,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelContent,
  type OverlayProps,
  OverlayTrigger,
  StackLayout,
  Text,
  Tooltip,
  useId,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const OverlayTemplate = (props: OverlayProps): ReactElement => {
  const { placement, ...rest } = props;
  const id = useId();

  return (
    <Overlay placement={placement} {...rest}>
      <OverlayTrigger>
        <Button>{placement}</Button>
      </OverlayTrigger>
      <OverlayPanel aria-labelledby={id}>
        <OverlayHeader header="Title" id={id} />
        <OverlayPanelContent>
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

export const Placement = (): ReactElement => (
  <StackLayout gap={1}>
    <OverlayTemplate placement="top" />
    <OverlayTemplate placement="bottom" />
    <OverlayTemplate placement="left" />
    <OverlayTemplate placement="right" />
  </StackLayout>
);
