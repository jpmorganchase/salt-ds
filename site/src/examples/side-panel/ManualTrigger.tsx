import {
  Button,
  FlexItem,
  FlexLayout,
  H2,
  StackLayout,
  Text,
  useId,
} from "@salt-ds/core";
import { SidePanel, SidePanelCloseButton } from "@salt-ds/lab";
import { useRef, useState } from "react";

export const ManualTrigger = () => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const headingId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <FlexLayout
      style={{
        height: 230,
      }}
      gap={0}
    >
      <FlexItem padding={1}>
        <Button
          ref={triggerRef}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={id}
        >
          {open ? "Close" : "Open"} Manual Panel
        </Button>
      </FlexItem>
      <SidePanel
        open={open}
        onOpenChange={setOpen}
        id={id}
        aria-labelledby={headingId}
        triggerRef={triggerRef}
      >
        <StackLayout align="start" gap={1}>
          <SidePanelCloseButton onClick={() => setOpen(false)} />
          <H2 id={headingId}>Section title</H2>
          <Text>
            This demonstrates manual panel control with the `triggerRef` prop,
            which ensures focus returns to the trigger button when the panel
            closes.
          </Text>
        </StackLayout>
      </SidePanel>
    </FlexLayout>
  );
};
