import {
  Button,
  H3,
  Overlay,
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
        <OverlayPanelContent>
          <StackLayout gap={0.5}>
            <H3 id={id}>
              <strong>Title</strong>
            </H3>
            <StackLayout gap={1} align="start">
              <Text>Content of Overlay</Text>
              <Tooltip content={"I'm a tooltip"}>
                <Button>hover me</Button>
              </Tooltip>
            </StackLayout>
          </StackLayout>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};

export const Placement = (): ReactElement => (
  <StackLayout gap={5}>
    <StackLayout gap={1} align="start">
      <OverlayTemplate placement="top" />
      <OverlayTemplate placement="bottom" />
    </StackLayout>
    <StackLayout gap={1} align="start">
      <OverlayTemplate placement="left" />
      <OverlayTemplate placement="right" />
    </StackLayout>
  </StackLayout>
);
