import {
  Button,
  Card,
  FlexItem,
  FlexLayout,
  Input,
  SidePanel,
  SidePanelCloseButton,
  SidePanelProvider,
  SidePanelTitle,
  SidePanelTrigger,
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
import styles from "./index.module.css";

const AppHeader = () => {
  return (
    <FlexLayout
      style={{
        flex: 0,
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
        bordered
        startAdornment={<SearchIcon aria-hidden />}
        placeholder="Search"
        style={{ width: 200 }}
      />
      <FlexItem align="center">
        <StackLayout direction="row" gap={1}>
          <Tooltip content="Help panel" hideArrow>
            <SidePanelTrigger>
              <Button appearance="transparent" aria-label="Help panel">
                <HelpCircleIcon aria-hidden />
              </Button>
            </SidePanelTrigger>
          </Tooltip>
          <Tooltip content="Notifications" hideArrow>
            <Button appearance="transparent" aria-label="Notifications">
              <NotificationIcon aria-hidden />
            </Button>
          </Tooltip>
          <Tooltip content="Chat" hideArrow>
            <Button appearance="transparent" aria-label="Chat">
              <ChattingIcon aria-hidden />
            </Button>
          </Tooltip>
        </StackLayout>
      </FlexItem>
    </FlexLayout>
  );
};

const PanelSurface = () => (
  <Card variant="primary" style={{ height: "100%" }}>
    <StackLayout gap={2}>
      <FlexLayout align="center" justify="space-between" gap={1}>
        <SidePanelTitle>Section title</SidePanelTitle>
        <SidePanelCloseButton />
      </FlexLayout>
      <Text>Side panel content goes here.</Text>
    </StackLayout>
  </Card>
);

export const CustomContainer = () => {
  return (
    <SidePanelProvider defaultOpen={true}>
      <div className={styles.appFrame}>
        <AppHeader />
        <FlexLayout
          gap={0}
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <FlexItem
            grow={1}
            style={{
              minHeight: 0,
              overflow: "auto",
            }}
          >
            <StackLayout gap={2} padding={2}>
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
                  key={`content-${i}`}
                  style={{
                    backgroundColor: "var(--salt-container-primary-background)",
                    borderRadius: "var(--salt-palette-corner-weak)",
                    border:
                      "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 80,
                  }}
                />
              ))}
            </StackLayout>
          </FlexItem>

          <SidePanel variant="none">
            <PanelSurface />
          </SidePanel>
        </FlexLayout>
      </div>
    </SidePanelProvider>
  );
};
