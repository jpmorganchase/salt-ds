import {
  BorderItem,
  BorderLayout,
  Button,
  FlexItem,
  FlexLayout,
  H2,
  Input,
  Link,
  StackLayout,
  Text,
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
  SidePanelCloseButton,
  SidePanelGroup,
  SidePanelTrigger,
} from "@salt-ds/lab";

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
          <Text styleAs="h2">Logo</Text>
        </FlexItem>
        <Input
          startAdornment={<SearchIcon />}
          placeholder="Search"
          style={{ width: 200 }}
        />

        <FlexItem align="center">
          <StackLayout direction="row" gap={1}>
            <SidePanelTrigger>
              <Button appearance="transparent" aria-label="open help panel">
                <HelpCircleIcon aria-hidden />
              </Button>
            </SidePanelTrigger>
            <Button appearance="transparent">
              <NotificationIcon aria-hidden />
            </Button>
            <Button appearance="transparent">
              <ChattingIcon aria-hidden />
            </Button>
          </StackLayout>
        </FlexItem>
      </FlexLayout>
    </header>
  );
};

export const WithAppHeader = () => {
  const headingId = useId();

  return (
    <SidePanelGroup>
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
          <FlexLayout padding={3}>
            <Link href="#">Link 1</Link>
            <Link href="#">Link 2</Link>
            <Link href="#">Link 3</Link>
          </FlexLayout>
          {Array.from({ length: 4 }, (_, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
              key={index}
              style={{
                padding: "var(--salt-spacing-300)",
                margin: "var(--salt-spacing-200) var(--salt-spacing-300)",
                backgroundColor: "var(--salt-container-secondary-background)",
              }}
            />
          ))}
        </BorderItem>
        <BorderItem position="east">
          <SidePanel aria-labelledby={headingId}>
            <StackLayout align="start" gap={1}>
              <SidePanelCloseButton />
              <H2 id={headingId}>Help & support</H2>
              <Text>
                The content shown here is for illustrative purposes and does not
                contain specific information or advice. Using placeholder text
                like this helps review formatting, spacing, and overall
                presentation in the user interface. Adjust the wording as needed
                to suit your particular requirements or design preferences.
              </Text>
            </StackLayout>
          </SidePanel>
        </BorderItem>
      </BorderLayout>
    </SidePanelGroup>
  );
};
