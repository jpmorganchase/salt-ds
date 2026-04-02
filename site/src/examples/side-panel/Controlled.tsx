import {
  Button,
  FlexItem,
  FlexLayout,
  H2,
  StackLayout,
  Text,
  useId,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import {
  SidePanel,
  SidePanelCloseTrigger,
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
              <SidePanelCloseTrigger onClick={() => setOpen(false)}>
                <Button
                  aria-label="Close"
                  appearance="transparent"
                  style={{ marginLeft: "auto" }}
                >
                  <CloseIcon aria-hidden />
                </Button>
              </SidePanelCloseTrigger>
              <H2 id={headingId}>Section Title</H2>
              <Text>Content for the primary side panel</Text>
            </StackLayout>
          </SidePanel>
        </FlexLayout>
      </SidePanelGroup>
    </StackLayout>
  );
};
