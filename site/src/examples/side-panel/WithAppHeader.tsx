import {
  BorderItem,
  BorderLayout,
  Button,
  FlexItem,
  FlexLayout,
  H2,
  Input,
  StackLayout,
  Text,
  Tooltip,
  useId,
} from "@salt-ds/core";
import {
  ChattingIcon,
  HelpCircleIcon,
  NotificationIcon,
  SearchIcon,
} from "@salt-ds/icons";
import {
  SidePanel,
  SidePanelContent,
  SidePanelProvider,
  SidePanelTrigger,
  useSidePanelContext,
} from "@salt-ds/lab";
import { ContentExample } from "src/examples/side-panel/ContentExample";

const DesktopAppHeader = () => {
  const { openState } = useSidePanelContext();
  return (
    <header>
      <FlexLayout
        style={{
          padding: "var(--salt-spacing-100) var(--salt-spacing-300)",
          position: "sticky",
          top: 0,
          width: "100%",
          zIndex: 1,
          borderBottom:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-primary-borderColor)",
        }}
        justify="space-between"
        gap={3}
      >
        <FlexItem align="center">
          <Text styleAs="h2">App name</Text>
        </FlexItem>
        <Input
          startAdornment={<SearchIcon />}
          placeholder="Search"
          style={{ width: 200 }}
        />

        <FlexItem align="center">
          <StackLayout direction="row" gap={1}>
            <Tooltip content="Toggle help panel" hideArrow>
              <SidePanelTrigger>
                <Button
                  appearance="transparent"
                  aria-label={
                    openState ? "Close help panel" : "Open help panel"
                  }
                >
                  <HelpCircleIcon aria-hidden />
                </Button>
              </SidePanelTrigger>
            </Tooltip>
            <Tooltip content="Show notifications" hideArrow>
              <Button appearance="transparent" aria-label="Show notifications">
                <NotificationIcon aria-hidden />
              </Button>
            </Tooltip>
            <Tooltip content="Open chat" hideArrow>
              <Button appearance="transparent" aria-label="Open chat">
                <ChattingIcon aria-hidden />
              </Button>
            </Tooltip>
          </StackLayout>
        </FlexItem>
      </FlexLayout>
    </header>
  );
};

export const WithAppHeader = () => {
  const headingId = useId();
  return (
    <SidePanelProvider defaultOpen={true}>
      <BorderLayout
        style={{
          position: "relative",
          width: "100%",
          border:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-primary-borderColor)",
        }}
      >
        <BorderItem position="north">
          <DesktopAppHeader />
        </BorderItem>
        <BorderItem position="center">
          <ContentExample />
        </BorderItem>
        <BorderItem position="east">
          <SidePanel aria-labelledby={headingId}>
            <SidePanelContent header={<H2 id={headingId}>Help & support</H2>}>
              <Text>
                The content shown here is for illustrative purposes and does not
                contain specific information or advice. Using placeholder text
                like this helps review formatting, spacing, and overall
                presentation in the user interface. Adjust the wording as needed
                to suit your particular requirements or design preferences.
              </Text>
            </SidePanelContent>
          </SidePanel>
        </BorderItem>
      </BorderLayout>
    </SidePanelProvider>
  );
};
