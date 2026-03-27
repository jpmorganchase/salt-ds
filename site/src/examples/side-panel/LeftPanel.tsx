import {
  Button,
  Dropdown,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  H2,
  Input,
  Option,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  useId,
} from "@salt-ds/core";
import { CloseIcon, SearchIcon } from "@salt-ds/icons";
import { SidePanel, SidePanelGroup, SidePanelTrigger } from "@salt-ds/lab";
import { useState } from "react";

export const LeftPanel = () => {
  const [open, setOpen] = useState(false);
  const headingId = useId();

  return (
    <SidePanelGroup open={open} onOpenChange={setOpen}>
      <FlexLayout
        style={{
          height: 300,
        }}
        gap={0}
      >
        <SidePanel aria-labelledby={headingId} position="left">
          <StackLayout>
            <Button
              appearance="transparent"
              aria-label="close panel"
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto" }}
            >
              <CloseIcon aria-hidden />
            </Button>
            <H2 id={headingId}>Filters</H2>
            <Input startAdornment={<SearchIcon />} placeholder="Search" />

            <FormField>
              <FormFieldLabel>Color</FormFieldLabel>
              <Dropdown>
                <Option value="red" />
                <Option value="blue" />
                <Option value="green" />
                <Option value="yellow" />
                <Option value="purple" />
                <Option value="orange" />
              </Dropdown>
              <FormFieldHelperText>Pick a color</FormFieldHelperText>
            </FormField>

            <FormField>
              <FormFieldLabel>Location</FormFieldLabel>
              <RadioButtonGroup>
                <RadioButton label="NAMR" value="namr" />
                <RadioButton label="APAC" value="apac" />
                <RadioButton label="EMEA" value="emea" />
              </RadioButtonGroup>
              <FormFieldHelperText>Select one that applies</FormFieldHelperText>
            </FormField>
            <FlexLayout>
              <Button sentiment="accented" appearance="bordered">
                Reset
              </Button>
              <Button sentiment="accented">Update</Button>
            </FlexLayout>
          </StackLayout>
        </SidePanel>
        <FlexLayout padding={1}>
          <SidePanelTrigger>
            <Button>{open ? "Close" : "Open"} Left Panel</Button>
          </SidePanelTrigger>
        </FlexLayout>
      </FlexLayout>
    </SidePanelGroup>
  );
};
