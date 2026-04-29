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
} from "@salt-ds/core";
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  type SidePanelProps,
  SidePanelProvider,
  SidePanelTitle,
  SidePanelTrigger,
  useSidePanelContext,
} from "@salt-ds/lab";
import { type ChangeEventHandler, useState } from "react";
import { ContentExample } from "./ContentExample";

const variantOptions = ["primary", "secondary", "tertiary", "none"];

export const Variants = () => {
  return (
    <SidePanelProvider defaultOpen={true}>
      <VariantsContent />
    </SidePanelProvider>
  );
};

const VariantsContent = () => {
  const [variant, setVariant] = useState<SidePanelProps["variant"]>("primary");
  const { CloseIcon } = useIcon();
  const { openState, setOpen } = useSidePanelContext();

  const handleVariantChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setVariant(event.target.value as SidePanelProps["variant"]);
  };

  return (
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

      <SidePanel position="right" variant={variant}>
        <SidePanelHeader>
          <SidePanelTitle>
            <H2>Section Title</H2>
          </SidePanelTitle>
          <Button
            aria-label="Close"
            appearance="transparent"
            onClick={() => setOpen(false)}
          >
            <CloseIcon aria-hidden />
          </Button>
        </SidePanelHeader>
        <SidePanelContent>
          <Text>Side panel content goes here.</Text>
        </SidePanelContent>
      </SidePanel>
    </FlexLayout>
  );
};
