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
import { SearchIcon } from "@salt-ds/icons";
import {
  SidePanel,
  SidePanelCloseButton,
  SidePanelGroup,
  SidePanelTrigger,
} from "@salt-ds/lab";

export const LeftPanel = () => {
  const headingId = useId();

  return (
    <SidePanelGroup>
      <FlexLayout
        style={{
          height: 300,
        }}
        gap={0}
      >
        <SidePanel aria-labelledby={headingId} position="left">
          <StackLayout>
            <SidePanelCloseButton />
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
            <FlexLayout gap={1}>
              <Button
                sentiment="accented"
                appearance="bordered"
                style={{ width: "100%" }}
              >
                Reset
              </Button>
              <Button sentiment="accented" style={{ width: "100%" }}>
                Update
              </Button>
            </FlexLayout>
          </StackLayout>
        </SidePanel>
        <FlexLayout padding={1}>
          <SidePanelTrigger>
            <Button>Open Left Panel</Button>
          </SidePanelTrigger>
        </FlexLayout>
      </FlexLayout>
    </SidePanelGroup>
  );
};
