import {
  Button,
  FlexLayout,
  H2,
  StackLayout,
  Text,
  useId,
} from "@salt-ds/core";
import { SidePanel } from "@salt-ds/lab";
import { useRef, useState } from "react";

export const ManualTriggerPanel = () => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const headingId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <FlexLayout
      style={{
        height: 300,
      }}
      gap={0}
    >
      <SidePanel
        open={open}
        onOpenChange={setOpen}
        id={id}
        aria-labelledby={headingId}
        triggerRef={triggerRef as React.MutableRefObject<HTMLElement | null>}
      >
        <StackLayout align="start" gap={1}>
          <Button onClick={() => setOpen(false)} style={{ marginLeft: "auto" }}>
            Close
          </Button>
          <H2 id={headingId}>Manual Trigger Link</H2>
          <Text>
            This example uses a trigger outside `SidePanelGroup`, with explicit
            triggerRef wiring for reliable focus return when the panel closes.
          </Text>
        </StackLayout>
      </SidePanel>
      <FlexLayout padding={1}>
        <Button
          ref={triggerRef}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={id}
        >
          {open ? "Close" : "Open"} Manual Panel
        </Button>
      </FlexLayout>
    </FlexLayout>
  );
};
