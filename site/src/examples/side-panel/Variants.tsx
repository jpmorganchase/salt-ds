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
  useId,
} from "@salt-ds/core";
import {
  SidePanel,
  SidePanelContent,
  type SidePanelProps,
  SidePanelProvider,
  SidePanelTrigger,
  useSidePanelContext,
} from "@salt-ds/lab";
import { type ChangeEventHandler, useState } from "react";
import { ContentExample } from "./ContentExample";

const variantOptions = ["primary", "secondary", "tertiary", "none"];

const SidePanelExample = () => {
  const [variant, setVariant] = useState<SidePanelProps["variant"]>("primary");
  const headingId = useId();
  const { openState } = useSidePanelContext();

  const handleVariantChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setVariant(event.target.value as SidePanelProps["variant"]);
  };

  return (
    <>
      <ContentExample>
        <StackLayout direction="column" gap={1}>
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
      </ContentExample>

      <SidePanel position="right" aria-labelledby={headingId} variant={variant}>
        <SidePanelContent header={<H2 id={headingId}>Section Title</H2>}>
          <Text>Side panel content goes here.</Text>
        </SidePanelContent>
      </SidePanel>
    </>
  );
};

export const Variants = () => (
  <SidePanelProvider defaultOpen={true}>
    <FlexLayout
      style={{
        width: "100%",
        height: 320,
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
