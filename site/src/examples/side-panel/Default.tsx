import { Button, FlexLayout, H2, StackLayout, Text } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { SidePanel } from "@salt-ds/lab";
import { useRef, useState } from "react";

export const Default = () => {
  const [openPrimary, setOpenPrimary] = useState(false);
  const [openSecondary, setOpenSecondary] = useState(false);
  const [openTertiary, setOpenTertiary] = useState(false);

  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const secondaryButtonRef = useRef<HTMLButtonElement>(null);
  const tertiaryButtonRef = useRef<HTMLButtonElement>(null);

  return (
    // <StackLayout>
    //   <SidePanelGroup open={openPrimary} onOpenChange={setOpenPrimary}>
    //     <FlexLayout
    //       style={{
    //         height: 100,
    //       }}
    //     >
    //       <FlexItem grow={1} padding={1}>
    //         <SidePanelTrigger>
    //           <Button>Primary side panel</Button>
    //         </SidePanelTrigger>
    //       </FlexItem>
    //       <SidePanel aria-label="Primary side panel">
    //         <Text>Content for the primary side panel</Text>
    //       </SidePanel>
    //     </FlexLayout>
    //   </SidePanelGroup>

    //   <SidePanelGroup open={openSecondary} onOpenChange={setOpenSecondary}>
    //     <FlexLayout
    //       style={{
    //         height: 100,
    //       }}
    //     >
    //       <FlexItem grow={1} padding={1}>
    //         <SidePanelTrigger>
    //           <Button>Secondary side panel</Button>
    //         </SidePanelTrigger>
    //       </FlexItem>
    //       <SidePanel aria-label="Secondary side panel" variant="secondary">
    //         <Text>Content for the secondary side panel</Text>
    //       </SidePanel>
    //     </FlexLayout>
    //   </SidePanelGroup>

    //   <SidePanelGroup open={openTertiary} onOpenChange={setOpenTertiary}>
    //     <FlexLayout
    //       style={{
    //         height: 100,
    //       }}
    //     >
    //       <FlexItem grow={1} padding={1}>
    //         <SidePanelTrigger>
    //           <Button>Tertiary side panel</Button>
    //         </SidePanelTrigger>
    //       </FlexItem>
    //       <SidePanel aria-label="Tertiary side panel" variant="tertiary">
    //         <Text>Content for the tertiary side panel</Text>
    //       </SidePanel>
    //     </FlexLayout>
    //   </SidePanelGroup>
    // </StackLayout>

    <FlexLayout
      style={{
        height: 180,
      }}
      gap={0}
    >
      <StackLayout padding={1}>
        <Button
          ref={primaryButtonRef}
          onClick={() => setOpenPrimary(!openPrimary)}
          aria-expanded={openPrimary}
        >
          {openPrimary ? "Close" : "Open"} Primary Panel
        </Button>
        <Button
          ref={secondaryButtonRef}
          onClick={() => setOpenSecondary(!openSecondary)}
          aria-expanded={openSecondary}
        >
          {openSecondary ? "Close" : "Open"} Secondary Panel
        </Button>
        <Button
          ref={tertiaryButtonRef}
          onClick={() => setOpenTertiary(!openTertiary)}
          aria-expanded={openTertiary}
        >
          {openTertiary ? "Close" : "Open"} Tertiary Panel
        </Button>
      </StackLayout>

      <SidePanel
        aria-label="primary side panel"
        open={openPrimary}
        onOpenChange={setOpenPrimary}
        width={200}
        triggerRef={primaryButtonRef}
      >
        <StackLayout align="start" gap={1}>
          <Button
            appearance="transparent"
            aria-label="close panel"
            onClick={() => setOpenPrimary(false)}
            style={{ marginLeft: "auto" }}
          >
            <CloseIcon aria-hidden />
          </Button>
          <H2>Section Title</H2>
          <Text>Content for the primary side panel</Text>
        </StackLayout>
      </SidePanel>
      <SidePanel
        aria-label="secondary side panel"
        open={openSecondary}
        onOpenChange={setOpenSecondary}
        variant="secondary"
        width={200}
        triggerRef={secondaryButtonRef}
      >
        <StackLayout align="start" gap={1}>
          <Button
            appearance="transparent"
            aria-label="close panel"
            onClick={() => setOpenSecondary(false)}
            style={{ marginLeft: "auto" }}
          >
            <CloseIcon aria-hidden />
          </Button>

          <H2>Section Title</H2>
          <Text>Content for the secondary side panel</Text>
        </StackLayout>
      </SidePanel>
      <SidePanel
        aria-label="tertiary side panel"
        open={openTertiary}
        onOpenChange={setOpenTertiary}
        variant="tertiary"
        width={200}
        triggerRef={tertiaryButtonRef}
      >
        <StackLayout align="start" gap={1}>
          <Button
            appearance="transparent"
            aria-label="close panel"
            onClick={() => setOpenTertiary(false)}
            style={{ marginLeft: "auto" }}
          >
            <CloseIcon aria-hidden />
          </Button>
          <H2>Section Title</H2>
          <Text>Content for the tertiary side panel</Text>
        </StackLayout>
      </SidePanel>
    </FlexLayout>
  );
};
