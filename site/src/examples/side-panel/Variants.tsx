import {
  Button,
  capitalize,
  FlexLayout,
  FormField,
  FormFieldLabel,
  RadioButton,
  RadioButtonGroup,
  SidePanel,
  SidePanelCloseButton,
  SidePanelContent,
  SidePanelHeader,
  type SidePanelProps,
  SidePanelProvider,
  SidePanelTitle,
  SidePanelTrigger,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { type ChangeEventHandler, useState } from "react";
import { ContentExample } from "./ContentExample";

import styles from "./index.module.css";

const variantOptions = ["primary", "secondary", "tertiary"];

export const Variants = () => {
  const [variant, setVariant] = useState<SidePanelProps["variant"]>("primary");

  const handleVariantChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setVariant(event.target.value as SidePanelProps["variant"]);
  };

  return (
    <SidePanelProvider defaultOpen={true}>
      <div className={styles.appFrame}>
        <FlexLayout gap={0} style={{ height: "100%" }}>
          <ContentExample>
            <StackLayout direction="column" gap={1}>
              <div>
                <SidePanelTrigger>
                  <Button style={{ whiteSpace: "nowrap" }}>
                    Toggle right panel
                  </Button>
                </SidePanelTrigger>
              </div>
              <FormField>
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
          </ContentExample>

          <SidePanel position="right" variant={variant}>
            <SidePanelHeader>
              <SidePanelTitle>Section Title</SidePanelTitle>
              <SidePanelCloseButton />
            </SidePanelHeader>
            <SidePanelContent>
              <Text>Side panel content goes here.</Text>
            </SidePanelContent>
          </SidePanel>
        </FlexLayout>
      </div>
    </SidePanelProvider>
  );
};
