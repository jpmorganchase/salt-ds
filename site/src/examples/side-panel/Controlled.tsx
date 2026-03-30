import {
  Button,
  FlexItem,
  FlexLayout,
  H2,
  StackLayout,
  Text,
  useId,
} from "@salt-ds/core";
import {
  SidePanel,
  SidePanelCloseButton,
  SidePanelGroup,
  SidePanelTrigger,
} from "@salt-ds/lab";
import { useState } from "react";

export const Controlled = () => {
  const [open, setOpen] = useState(false);
  const headingId = useId();

  return (
    <StackLayout align="center">
      <SidePanelGroup open={open} onOpenChange={setOpen}>
        <FlexLayout
          style={{
            height: 200,
          }}
        >
          <FlexItem grow={1} padding={1}>
            <SidePanelTrigger>
              <Button>Toggle side panel</Button>
            </SidePanelTrigger>
          </FlexItem>
          <SidePanel aria-labelledby={headingId}>
            <StackLayout align="start" gap={1}>
              <SidePanelCloseButton onClick={() => setOpen(false)} />
              <H2 id={headingId}>Section Title</H2>
              <Text>Content for the primary side panel</Text>
            </StackLayout>
          </SidePanel>
        </FlexLayout>
      </SidePanelGroup>
    </StackLayout>
  );
};
