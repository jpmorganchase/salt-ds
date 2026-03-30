import {
  Button,
  FlexItem,
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
  SidePanelGroup,
  type SidePanelProps,
  SidePanelTrigger,
} from "@salt-ds/lab";
import { type ChangeEventHandler, useState } from "react";

const variantOptions = ["primary", "secondary", "tertiary"];

export const Default = () => {
  const [variant, setVariant] = useState<SidePanelProps["variant"]>("primary");
  const headingId = useId();

  const handleVariantChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setVariant(value as SidePanelProps["variant"]);
  };

  return (
    <StackLayout align="center">
      <SidePanelGroup>
        <FlexLayout
          style={{
            height: 200,
          }}
        >
          <FlexItem grow={1} padding={1}>
            <SidePanelTrigger>
              <Button>Toggle side panel</Button>
            </SidePanelTrigger>
          </FlexItem>
          <SidePanel aria-labelledby={headingId} variant={variant}>
            <StackLayout align="start" gap={1}>
              <H2 id={headingId}>Section Title</H2>
              <Text>Content for the primary side panel</Text>
            </StackLayout>
          </SidePanel>
        </FlexLayout>
      </SidePanelGroup>

      <StackLayout>
        <FormField>
          <FormFieldLabel>Variant</FormFieldLabel>
          <RadioButtonGroup
            direction="horizontal"
            aria-label="Variant Controls"
            name="variant"
            onChange={handleVariantChange}
            value={variant}
          >
            {variantOptions.map((alignment) => (
              <RadioButton
                key={alignment}
                label={`${alignment.charAt(0).toUpperCase()}${alignment.slice(
                  1,
                )}`}
                value={alignment}
              />
            ))}
          </RadioButtonGroup>
        </FormField>
      </StackLayout>
    </StackLayout>
  );
};
