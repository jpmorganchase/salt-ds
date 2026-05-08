import {
  BorderItem,
  BorderLayout,
  Button,
  FlexItem,
  FlexLayout,
  Input,
  Link,
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
import { ContentExample } from "./ContentExample";

const DesktopAppHeader = () => {
  return (
    <FlexLayout
      style={{
        padding: "var(--salt-spacing-100) var(--salt-spacing-200)",
        width: "100%",
        borderBottom:
          "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-primary-borderColor)",
        background: "var(--salt-container-primary-background)",
      }}
      justify="space-between"
      gap={3}
    >
      <FlexItem align="center">
        <Text styleAs="h2">App name</Text>
      </FlexItem>
      <Input
        aria-label="Search"
        startAdornment={<SearchIcon aria-hidden />}
        bordered
        placeholder="Search"
        style={{ width: 200 }}
      />

      <FlexItem align="center">
        <StackLayout direction="row" gap={1}>
          <Tooltip content="Help panel">
            <SidePanelTrigger>
              <Button appearance="transparent" aria-label="Help panel">
                <HelpCircleIcon aria-hidden />
              </Button>
            </SidePanelTrigger>
          </Tooltip>
          <Tooltip content="Notifications">
            <Button appearance="transparent" aria-label="Notifications">
              <NotificationIcon aria-hidden />
            </Button>
          </Tooltip>
          <Tooltip content="Chat">
            <Button appearance="transparent" aria-label="Chat">
              <ChattingIcon aria-hidden />
            </Button>
          </Tooltip>
        </StackLayout>
      </FlexItem>
    </FlexLayout>
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
          background: "var(--salt-container-secondary-background)",
        }}
        gap={0}
      >
        <BorderItem position="north">
          <DesktopAppHeader />
        </BorderItem>
        <BorderItem
          position="center"
          style={{ padding: "var(--salt-spacing-200)" }}
        >
          <FlexLayout>
            <Link href="#">Link 1</Link>
            <Link href="#">Link 2</Link>
            <Link href="#">Link 3</Link>
          </FlexLayout>
          <ContentExample style={{ padding: 0 }} />
        </BorderItem>
        <BorderItem position="east">
          <HelpPanel />
        </BorderItem>
      </BorderLayout>
    </SidePanelProvider>
  );
};
