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
import { CloseIcon } from "@salt-ds/icons";
import {
  SidePanel,
  SidePanelGroup,
  type SidePanelProps,
  SidePanelTrigger,
} from "@salt-ds/lab";
import { type ChangeEventHandler, useState } from "react";

const variantOptions = ["primary", "secondary", "tertiary"];

export const Default = () => {
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<SidePanelProps["variant"]>("primary");
  const headingId = useId();

  const handleVariantChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setVariant(value as SidePanelProps["variant"]);
  };

  return (
    <StackLayout>
      <SidePanelGroup open={open} onOpenChange={setOpen}>
        <FlexLayout
          style={{
            height: 200,
          }}
        >
          <FlexItem grow={1} padding={1}>
            <SidePanelTrigger>
              <Button>{open ? "Close" : "Open"} side panel</Button>
            </SidePanelTrigger>
          </FlexItem>
          <SidePanel
            position="right"
            aria-labelledby={headingId}
            variant={variant}
          >
            <StackLayout align="start" gap={1}>
              <Button
                appearance="transparent"
                aria-label="close panel"
                onClick={() => setOpen(false)}
                style={{ marginLeft: "auto" }}
              >
                <CloseIcon aria-hidden />
              </Button>
              <H2 id={headingId}>Section Title</H2>
              <Text>Content for the primary side panel</Text>
            </StackLayout>
          </SidePanel>
        </FlexLayout>
      </SidePanelGroup>
      <StackLayout>
        <FormField>
          <FormFieldLabel>Direction</FormFieldLabel>
          <RadioButtonGroup
            direction={"horizontal"}
            aria-label="Direction Controls"
            name="direction"
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
