import {
  Card,
  type CardProps,
  capitalize,
  FormField,
  FormFieldLabel,
  GridLayout,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
} from "@salt-ds/core";
import {
  type ChangeEventHandler,
  type CSSProperties,
  type ReactElement,
  useState,
} from "react";

type CardVariant = NonNullable<CardProps["variant"]>;

const variantOptions = [
  "primary",
  "secondary",
  "tertiary",
  "ghost",
] satisfies CardVariant[];

const cardStyle = {
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  minHeight: 144,
} satisfies CSSProperties;

export const BorderColor = (): ReactElement => {
  const [variant, setVariant] = useState<CardVariant>("secondary");

  const handleVariantChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setVariant(event.target.value as CardVariant);
  };

  return (
    <StackLayout align="center" style={{ width: "100%" }}>
      <GridLayout
        columns="repeat(auto-fit, minmax(120px, 1fr))"
        style={{ width: "100%" }}
      >
        <Card
          borderColor="strong"
          elevation="flat"
          style={cardStyle}
          variant={variant}
        >
          Strong
        </Card>
        <Card
          borderColor="default"
          elevation="flat"
          style={cardStyle}
          variant={variant}
        >
          Default
        </Card>
        <Card
          borderColor="subtle"
          elevation="flat"
          style={cardStyle}
          variant={variant}
        >
          Subtle
        </Card>
        <Card
          borderColor="none"
          elevation="flat"
          style={cardStyle}
          variant={variant}
        >
          None
        </Card>
      </GridLayout>
      <FormField style={{ width: "auto" }}>
        <FormFieldLabel>Variant</FormFieldLabel>
        <RadioButtonGroup
          direction="horizontal"
          name="variant"
          onChange={handleVariantChange}
          value={variant}
        >
          {variantOptions.map((option) => (
            <RadioButton
              key={option}
              label={capitalize(option)}
              value={option}
            />
          ))}
        </RadioButtonGroup>
      </FormField>
    </StackLayout>
  );
};
