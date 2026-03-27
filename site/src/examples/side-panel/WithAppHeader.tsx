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
  useId,
} from "@salt-ds/core";
import {
  ChattingIcon,
  CloseIcon,
  HelpCircleIcon,
  NotificationIcon,
  SearchIcon,
} from "@salt-ds/icons";
import { SidePanel, SidePanelGroup, SidePanelTrigger } from "@salt-ds/lab";
import { useState } from "react";

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
  const [open, setOpen] = useState(false);
  const headingId = useId();

  return (
    <SidePanelGroup open={open} onOpenChange={setOpen}>
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
          {Array.from({ length: 4 }, (_, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
              key={index}
              style={{
                padding: "var(--salt-spacing-400)",
                margin: "var(--salt-spacing-400)",
                backgroundColor: "var(--salt-container-secondary-background)",
              }}
            />
          ))}
        </BorderItem>
        <BorderItem position="east">
          <SidePanel aria-labelledby={headingId}>
            <StackLayout align="start" gap={1}>
              <Button
                aria-label="close panel"
                appearance="transparent"
                onClick={() => setOpen(false)}
                style={{ marginLeft: "auto" }}
              >
                <CloseIcon aria-hidden />
              </Button>
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
