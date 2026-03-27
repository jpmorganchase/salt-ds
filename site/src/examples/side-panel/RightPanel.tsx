import {
  Button,
  Divider,
  FlexItem,
  FlexLayout,
  H2,
  H3,
  StackLayout,
  Text,
  useId,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { SidePanel, SidePanelGroup, SidePanelTrigger } from "@salt-ds/lab";
import { useState } from "react";

const DetailsExample = () => (
  <>
    <H3>Metadata</H3>
    <FlexLayout justify="space-between">
      <Text>Use case name</Text>
      <Text>
        <strong>lorem ipsum</strong>
      </Text>
    </FlexLayout>
    <FlexLayout justify="space-between">
      <Text>Account</Text>
      <Text>
        <strong>lorem ipsum</strong>
      </Text>
    </FlexLayout>
    <FlexLayout justify="space-between">
      <Text>Payment type</Text>
      <Text>
        <strong>lorem ipsum</strong>
      </Text>
    </FlexLayout>
    <Divider />
  </>
);

export const RightPanel = () => {
  const [open, setOpen] = useState(false);
  const headingId = useId();

  return (
    <SidePanelGroup open={open} onOpenChange={setOpen}>
      <FlexLayout
        style={{
          height: 300,
        }}
      >
        <FlexItem grow={1} padding={1}>
          <SidePanelTrigger>
            <Button>{open ? "Close" : "Open"} Right Panel</Button>
          </SidePanelTrigger>
        </FlexItem>
        <SidePanel position="right" aria-labelledby={headingId}>
          <StackLayout>
            <Button
              appearance="transparent"
              aria-label="close panel"
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto" }}
            >
              <CloseIcon aria-hidden />
            </Button>
            <H2 id={headingId}>Use case details</H2>

            {Array.from({ length: 2 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
              <DetailsExample key={index} />
            ))}
            <FlexLayout>
              <Button appearance="bordered" sentiment="accented">
                Cancel
              </Button>
              <Button sentiment="accented">Review</Button>
            </FlexLayout>
          </StackLayout>
        </SidePanel>
      </FlexLayout>
    </SidePanelGroup>
  );
};
