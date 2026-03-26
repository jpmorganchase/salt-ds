import {
  BorderItem,
  BorderLayout,
  Button,
  FlexItem,
  FlexLayout,
  H2,
  NavigationItem,
  StackLayout,
  Text,
  useId,
} from "@salt-ds/core";
import {
  CloseIcon,
  GithubIcon,
  HelpCircleIcon,
  StackoverflowIcon,
} from "@salt-ds/icons";
import { SidePanel, SidePanelGroup, SidePanelTrigger } from "@salt-ds/lab";
import { useEffect, useState } from "react";

const DesktopAppHeader = ({ items }: { items?: string[] }) => {
  const [active, setActive] = useState(items?.[0]);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const setScroll = () => {
      setOffset(window.scrollY);
    };

    window.addEventListener("scroll", setScroll);
    return () => {
      window.removeEventListener("scroll", setScroll);
    };
  }, []);

  return (
    <header>
      <FlexLayout
        style={{
          paddingLeft: "var(--salt-spacing-300)",
          paddingRight: "var(--salt-spacing-300)",
          backgroundColor: "var(--salt-container-primary-background)",
          position: "sticky",
          top: 0,
          width: "100%",
          zIndex: 1,
          boxShadow:
            offset > 0 ? "var(--salt-overlayable-shadow-scroll)" : "none",
          borderBottom:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-primary-borderColor)",
        }}
        justify="space-between"
        gap={3}
      >
        <FlexItem align="center">
          <Text styleAs="h2">Logo</Text>
        </FlexItem>
        <nav>
          <ul
            style={{
              display: "flex",
              listStyle: "none",
              padding: "0",
              margin: "0",
            }}
          >
            {items?.map((item) => (
              <li key={item}>
                <NavigationItem
                  active={active === item}
                  href="#"
                  onClick={() => setActive(item)}
                >
                  {item}
                </NavigationItem>
              </li>
            ))}
          </ul>
        </nav>
        <FlexItem align="center">
          <StackLayout direction="row" gap={1}>
            <SidePanelTrigger>
              <Button appearance="transparent" aria-label="open help panel">
                <HelpCircleIcon aria-hidden />
              </Button>
            </SidePanelTrigger>
            <Button appearance="transparent">
              <StackoverflowIcon aria-hidden />
            </Button>
            <Button appearance="transparent">
              <GithubIcon aria-hidden />
            </Button>
          </StackLayout>
        </FlexItem>
      </FlexLayout>
    </header>
  );
};

export const WithAppHeader = () => {
  const items = ["Home", "About", "Services"];
  const [open, setOpen] = useState(false);
  const headingId = useId();

  return (
    <SidePanelGroup
      open={open}
      onOpenChange={setOpen}
      style={{ position: "relative", width: "100%" }}
    >
      <BorderLayout>
        <BorderItem position="north">
          <DesktopAppHeader items={items} />
        </BorderItem>
        <BorderItem position="center">
          {Array.from({ length: 5 }, (_, index) => (
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
