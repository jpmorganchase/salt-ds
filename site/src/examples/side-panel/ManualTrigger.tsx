import {
  Button,
  FlexLayout,
  H2,
  StackLayout,
  Text,
  useId,
} from "@salt-ds/core";
import { SidePanel } from "@salt-ds/lab";
import { type CSSProperties, useRef, useState } from "react";

const panelStyle = {
  "--saltSidePanel-width": "150px",
} as CSSProperties;

export const ManualTrigger = () => {
  const [openLeft, setOpenLeft] = useState(false);
  const [openRight, setOpenRight] = useState(false);
  const leftPanelId = useId();
  const rightPanelId = useId();
  const leftHeadingId = useId();
  const rightHeadingId = useId();

  const leftTriggerRef = useRef<HTMLButtonElement | null>(null);
  const rightTriggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <FlexLayout
      style={{
        height: 230,
      }}
      gap={0}
    >
      <SidePanel
        open={openLeft}
        onOpenChange={setOpenLeft}
        id={leftPanelId}
        aria-labelledby={leftHeadingId}
        triggerRef={leftTriggerRef}
        position="left"
        style={panelStyle}
        variant="secondary"
      >
        <StackLayout align="start" gap={1}>
          <H2 id={leftHeadingId}>Left Panel</H2>
          <Text>Left panel content.</Text>
        </StackLayout>
      </SidePanel>

      <StackLayout gap={2} padding={2}>
        <Button
          ref={leftTriggerRef}
          onClick={() => setOpenLeft(!openLeft)}
          aria-expanded={openLeft}
          aria-controls={leftPanelId}
        >
          {openLeft ? "Close" : "Open"} Left Panel
        </Button>
        <Button
          ref={rightTriggerRef}
          onClick={() => setOpenRight(!openRight)}
          aria-expanded={openRight}
          aria-controls={rightPanelId}
        >
          {openRight ? "Close" : "Open"} Right Panel
        </Button>
      </StackLayout>
      <SidePanel
        open={openRight}
        onOpenChange={setOpenRight}
        id={rightPanelId}
        aria-labelledby={rightHeadingId}
        triggerRef={rightTriggerRef}
        style={panelStyle}
        variant="tertiary"
      >
        <StackLayout align="start" gap={1}>
          <H2 id={rightHeadingId}>Right Panel</H2>
          <Text>Right panel content.</Text>
        </StackLayout>
      </SidePanel>
    </FlexLayout>
  );
};
