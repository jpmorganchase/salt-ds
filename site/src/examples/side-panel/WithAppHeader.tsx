import {
  BorderItem,
  BorderLayout,
  Button,
  FlexItem,
  FlexLayout,
  Input,
  StackLayout,
  Text,
  Tooltip,
} from "@salt-ds/core";
import {
  ChattingIcon,
  HelpCircleIcon,
  NotificationIcon,
  SearchIcon,
} from "@salt-ds/icons";
import {
  SidePanel,
  SidePanelCloseButton,
  SidePanelContent,
  SidePanelHeader,
  SidePanelProvider,
  SidePanelTitle,
  SidePanelTrigger,
} from "@salt-ds/lab";
import { ContentExample } from "src/examples/side-panel/ContentExample";

const DesktopAppHeader = () => {
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
            <Tooltip content="Open help panel" hideArrow>
              <SidePanelTrigger>
                <Button appearance="transparent" aria-label="Open help panel">
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

const HelpPanel = () => {
  return (
    <SidePanel>
      <SidePanelHeader>
        <SidePanelTitle>Help & support</SidePanelTitle>
        <SidePanelCloseButton />
      </SidePanelHeader>
      <SidePanelContent>
        <Text>
          The content shown here is for illustrative purposes and does not
          contain specific information or advice. Using placeholder text like
          this helps review formatting, spacing, and overall presentation in the
          user interface. Adjust the wording as needed to suit your particular
          requirements or design preferences.
        </Text>
      </SidePanelContent>
    </SidePanel>
  );
};

export const WithAppHeader = () => {
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
          <HelpPanel />
        </BorderItem>
      </BorderLayout>
    </SidePanelProvider>
  );
};
