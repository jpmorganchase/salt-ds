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
        aria-labelledby={id}
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
          <H2 id={id}>Section Title</H2>
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
        <Button onClick={() => setOpen(!open)}>Open Left Panel</Button>
      </FlexLayout>
    </FlexLayout>
  );
};

export const Right: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <FlexLayout
      style={{
        height: "100vh",
      }}
    >
      <FlexItem grow={1} padding={1}>
        <Button onClick={() => setOpen(!open)}>Open Right Panel</Button>
      </FlexItem>
      <SidePanel
        open={open}
        onOpenChange={setOpen}
        side="right"
        aria-labelledby={id}
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
          <H2 id={id}>Section Title</H2>
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

  return (
    <StackLayout gap={0}>
      <SidePanel
        open={open}
        onOpenChange={setOpen}
        side="top"
        aria-labelledby={id}
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
          <H2 id={id}>Section title</H2>
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
        <Button onClick={() => setOpen(!open)}>Open top panel</Button>
      </FlexItem>
    </StackLayout>
  );
};

export const Bottom: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <StackLayout
      style={{
        height: "100vh",
      }}
      gap={0}
    >
      <FlexItem grow={1} padding={1}>
        <Button onClick={() => setOpen(!open)}>Open bottom panel</Button>
      </FlexItem>
      <SidePanel
        open={open}
        onOpenChange={setOpen}
        side="bottom"
        aria-labelledby={id}
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
          <H2 id={id}>Section title</H2>
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
