import {
  Button,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  H2,
  Input,
  StackLayout,
  Text,
  useId,
} from "@salt-ds/core";
import { SidePanel } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";
import "./side-panel.css";

export default {
  title: "Lab/SidePanel",
  component: SidePanel,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof SidePanel>;

const FormFieldExample = () => (
  <FormField>
    <FormFieldLabel>Label</FormFieldLabel>
    <Input />
    <FormFieldHelperText>Help text appears here</FormFieldHelperText>
  </FormField>
);

export const Left: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const headingId = useId();

  return (
    <FlexLayout
      style={{
        height: "100vh",
      }}
      gap={0}
    >
      <SidePanel
        open={open}
        onOpenChange={setOpen}
        id={id}
        aria-labelledby={headingId}
        // style={
        //   {
        //     "--saltSidePanel-width": "500px",
        //   } as React.CSSProperties
        // }
        // className="customWidth"
      >
        <StackLayout align="start" gap={1}>
          <Button onClick={() => setOpen(false)} style={{ marginLeft: "auto" }}>
            Close
          </Button>
          <H2 id={headingId}>Section Title</H2>
          <Text>
            This placeholder text is provided to illustrate how content will
            appear within the component. The sentences are intended for
            demonstration only and do not convey specific information. Generic
            examples like this help review layout, spacing, and overall design.
            Adjust the wording as needed to fit your use case or display
            requirements.
          </Text>
          {Array.from({ length: 7 }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
            <FormFieldExample key={index} />
          ))}
        </StackLayout>
      </SidePanel>
      <FlexLayout gap={1} padding={1}>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
        <Button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={id}
        >
          Open Left Panel
        </Button>
      </FlexLayout>
    </FlexLayout>
  );
};

export const Right: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const headingId = useId();

  return (
    <FlexLayout
      style={{
        height: "100vh",
      }}
    >
      <FlexItem grow={1} padding={1}>
        <Button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={id}
        >
          Open Right Panel
        </Button>
      </FlexItem>
      <SidePanel
        open={open}
        onOpenChange={setOpen}
        side="right"
        id={id}
        aria-labelledby={headingId}
        style={
          {
            "--saltSidePanel-width": "500px",
          } as React.CSSProperties
        }
      >
        <StackLayout align="start" gap={1}>
          <Button onClick={() => setOpen(false)} style={{ marginLeft: "auto" }}>
            Close
          </Button>
          <H2 id={headingId}>Section Title</H2>
          <Text>
            This placeholder text is provided to illustrate how content will
            appear within the component. The sentences are intended for
            demonstration only and do not convey specific information. Generic
            examples like this help review layout, spacing, and overall design.
            Adjust the wording as needed to fit your use case or display
            requirements.
          </Text>
          {Array.from({ length: 7 }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
            <FormFieldExample key={index} />
          ))}
        </StackLayout>
      </SidePanel>
    </FlexLayout>
  );
};

export const Top: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const headingId = useId();

  return (
    <StackLayout gap={0}>
      <SidePanel
        open={open}
        onOpenChange={setOpen}
        side="top"
        id={id}
        aria-labelledby={headingId}
        style={{
          height: 280,
        }}
      >
        <StackLayout align="start">
          <Button
            onClick={() => setOpen(false)}
            style={{
              marginLeft: "auto",
            }}
          >
            Close
          </Button>
          <H2 id={headingId}>Section title</H2>
          <Text>
            This placeholder text is provided to illustrate how content will
            appear within the component. The sentences are intended for
            demonstration only and do not convey specific information. Generic
            examples like this help review layout, spacing, and overall design.
            Adjust the wording as needed to fit your use case or display
            requirements.
          </Text>
          <FlexLayout>
            {Array.from({ length: 4 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
              <FormFieldExample key={index} />
            ))}
          </FlexLayout>
        </StackLayout>
      </SidePanel>
      <FlexItem padding={1}>
        <Button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={id}
        >
          Open top panel
        </Button>
      </FlexItem>
    </StackLayout>
  );
};

export const Bottom: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const headingId = useId();

  return (
    <StackLayout
      style={{
        height: "100vh",
      }}
      gap={0}
    >
      <FlexItem grow={1} padding={1}>
        <Button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={id}
        >
          Open bottom panel
        </Button>
      </FlexItem>
      <SidePanel
        open={open}
        onOpenChange={setOpen}
        side="bottom"
        id={id}
        aria-labelledby={headingId}
      >
        <StackLayout align="start">
          <Button
            onClick={() => setOpen(false)}
            style={{
              marginLeft: "auto",
            }}
          >
            Close
          </Button>
          <H2 id={headingId}>Section title</H2>
          <Text>
            This placeholder text is provided to illustrate how content will
            appear within the component. The sentences are intended for
            demonstration only and do not convey specific information. Generic
            examples like this help review layout, spacing, and overall design.
            Adjust the wording as needed to fit your use case or display
            requirements.
          </Text>
          <FlexLayout>
            {Array.from({ length: 4 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Acceptable in this case since content is static and not re-orderable
              <FormFieldExample key={index} />
            ))}
          </FlexLayout>
        </StackLayout>
      </SidePanel>
    </StackLayout>
  );
};

export const Variants: StoryFn = () => {
  const [openPrimary, setOpenPrimary] = useState(false);
  const [openSecondary, setOpenSecondary] = useState(false);
  const [openTertiary, setOpenTertiary] = useState(false);
  const primaryPanelId = useId();
  const secondaryPanelId = useId();
  const tertiaryPanelId = useId();
  const primaryHeadingId = useId();
  const secondaryHeadingId = useId();
  const tertiaryHeadingId = useId();

  return (
    <StackLayout gap={2} style={{ padding: "16px" }}>
      <FlexLayout gap={1}>
        <Button
          onClick={() => setOpenPrimary(!openPrimary)}
          aria-expanded={openPrimary}
          aria-controls={primaryPanelId}
        >
          Toggle Primary Panel
        </Button>
        <Button
          onClick={() => setOpenSecondary(!openSecondary)}
          aria-expanded={openSecondary}
          aria-controls={secondaryPanelId}
        >
          Toggle Secondary Panel
        </Button>
        <Button
          onClick={() => setOpenTertiary(!openTertiary)}
          aria-expanded={openTertiary}
          aria-controls={tertiaryPanelId}
        >
          Toggle Tertiary Panel
        </Button>
      </FlexLayout>
      <FlexLayout gap={0} style={{ minHeight: "400px" }}>
        <SidePanel
          open={openPrimary}
          onOpenChange={setOpenPrimary}
          variant="primary"
          side="left"
          id={primaryPanelId}
          aria-labelledby={primaryHeadingId}
        >
          <StackLayout align="start" gap={1}>
            <Button
              onClick={() => setOpenPrimary(false)}
              style={{ marginLeft: "auto" }}
            >
              Close
            </Button>
            <H2 id={primaryHeadingId}>Primary Variant</H2>
            <Text>
              This panel uses the primary variant, which is the default
              background color for containers.
            </Text>
            <FormFieldExample />
            <FormFieldExample />
          </StackLayout>
        </SidePanel>
        <SidePanel
          open={openSecondary}
          onOpenChange={setOpenSecondary}
          variant="secondary"
          side="left"
          id={secondaryPanelId}
          aria-labelledby={secondaryHeadingId}
        >
          <StackLayout align="start" gap={1}>
            <Button
              onClick={() => setOpenSecondary(false)}
              style={{ marginLeft: "auto" }}
            >
              Close
            </Button>
            <H2 id={secondaryHeadingId}>Secondary Variant</H2>
            <Text>
              This panel uses the secondary variant with a different background
              color.
            </Text>
            <FormFieldExample />
            <FormFieldExample />
          </StackLayout>
        </SidePanel>
        <SidePanel
          open={openTertiary}
          onOpenChange={setOpenTertiary}
          variant="tertiary"
          side="left"
          id={tertiaryPanelId}
          aria-labelledby={tertiaryHeadingId}
        >
          <StackLayout align="start" gap={1}>
            <Button
              onClick={() => setOpenTertiary(false)}
              style={{ marginLeft: "auto" }}
            >
              Close
            </Button>
            <H2 id={tertiaryHeadingId}>Tertiary Variant</H2>
            <Text>
              This panel uses the tertiary variant with yet another background
              color.
            </Text>
            <FormFieldExample />
            <FormFieldExample />
          </StackLayout>
        </SidePanel>
        <FlexItem grow={1} style={{ padding: "16px" }}>
          <Text>
            Open the panels to see the different variant backgrounds. Each
            variant corresponds to different container background tokens.
          </Text>
        </FlexItem>
      </FlexLayout>
    </StackLayout>
  );
};
