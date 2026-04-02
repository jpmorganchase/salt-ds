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
import {
  SidePanel,
  SidePanelCloseTrigger,
  SidePanelGroup,
  SidePanelTrigger,
} from "@salt-ds/lab";

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
  const headingId = useId();

  return (
    <SidePanelGroup>
      <FlexLayout
        style={{
          height: 300,
        }}
      >
        <FlexItem grow={1} padding={1}>
          <SidePanelTrigger>
            <Button>Open Right Panel</Button>
          </SidePanelTrigger>
        </FlexItem>
        <SidePanel position="right" aria-labelledby={headingId}>
          <StackLayout>
            <FlexLayout align="center">
              <H2 id={headingId}>Use case details</H2>
              <SidePanelCloseTrigger>
                <Button
                  aria-label="Close"
                  appearance="transparent"
                  style={{ marginLeft: "auto" }}
                >
                  <CloseIcon aria-hidden />
                </Button>
              </SidePanelCloseTrigger>
            </FlexLayout>

            {Array.from({ length: 2 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
              <DetailsExample key={index} />
            ))}
            <FlexLayout gap={1}>
              <Button
                appearance="bordered"
                sentiment="accented"
                style={{ width: "100%" }}
              >
                Cancel
              </Button>
              <Button sentiment="accented" style={{ width: "100%" }}>
                Review
              </Button>
            </FlexLayout>
          </StackLayout>
        </SidePanel>
      </FlexLayout>
    </SidePanelGroup>
  );
};
