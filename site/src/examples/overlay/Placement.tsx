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

export const Placement = (): ReactElement => (
  <StackLayout gap={1}>
    <OverlayTemplate placement="top" />
    <OverlayTemplate placement="bottom" />
    <OverlayTemplate placement="left" />
    <OverlayTemplate placement="right" />
  </StackLayout>
);
