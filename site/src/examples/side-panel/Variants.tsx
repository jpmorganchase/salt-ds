import {
  Button,
  FlexLayout,
  FormField,
  FormFieldLabel,
  H2,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Text,
  useIcon,
  useId,
} from "@salt-ds/core";
import {
  SidePanel,
  type SidePanelProps,
  SidePanelProvider,
  SidePanelTrigger,
  useSidePanelContext,
} from "@salt-ds/lab";
import { type ChangeEventHandler, useState } from "react";

const variantOptions = ["primary", "secondary", "tertiary"];

const SidePanelExample = () => {
  const [variant, setVariant] = useState<SidePanelProps["variant"]>("primary");
  const headingId = useId();
  const { CloseIcon } = useIcon();
  const { openState, setOpen } = useSidePanelContext();

  const handleVariantChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setVariant(event.target.value as SidePanelProps["variant"]);
  };

  return (
    <>
      <StackLayout
        direction={"column"}
        style={{ flex: 1, padding: "var(--salt-spacing-300)" }}
      >
        <SidePanelTrigger>
          <Button style={{ width: "fit-content", whiteSpace: "nowrap" }}>
            {openState ? "Close" : "Open"} right panel
          </Button>
        </SidePanelTrigger>
        <FormField>
          <FormFieldLabel>Variant</FormFieldLabel>
          <RadioButtonGroup
            direction="horizontal"
            aria-label="Variant Controls"
            name="variant"
            onChange={handleVariantChange}
            value={variant}
          >
            {variantOptions.map((option) => (
              <RadioButton
                key={option}
                label={`${option.charAt(0).toUpperCase()}${option.slice(1)}`}
                value={option}
              />
            ))}
          </RadioButtonGroup>
        </FormField>
      </StackLayout>

      <SidePanel position="right" aria-labelledby={headingId} variant={variant}>
        <StackLayout>
          <FlexLayout align="center">
            <H2 id={headingId} style={{ flex: 1 }}>
              Section Title
            </H2>
            <Button
              aria-label="Close"
              appearance="transparent"
              onClick={() => setOpen(false)}
            >
              <CloseIcon aria-hidden />
            </Button>
          </FlexLayout>
          <Text>Side panel content goes here.</Text>
        </StackLayout>
      </SidePanel>
    </>
  );
};

export const Variants = () => (
  <SidePanelProvider>
    <FlexLayout
      style={{
        width: "100%",
        height: 300,
        border:
          "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
        borderRadius: "var(--salt-palette-corner-weak)",
      }}
      gap={0}
    >
      <SidePanelExample />
    </FlexLayout>
  </SidePanelProvider>
);
