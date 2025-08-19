import {
  Button,
  Checkbox,
  ComboBox,
  Drawer,
  FlexItem,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  H2,
  Input,
  Option,
  StackLayout,
  useId,
} from "@salt-ds/core";
import {
  type ChangeEvent,
  type ReactElement,
  type SyntheticEvent,
  useState,
} from "react";

export const MandatoryAction = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const id = useId();

  const postcodes = ["05011", "01050", "03040", "11050"];

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    _event: SyntheticEvent,
    newSelected: string[],
  ) => {
    setValue(newSelected.length === 1 ? newSelected[0] : "");
  };

  return (
    <>
      <Button onClick={handleRequestOpen}>Open Mandatory Action Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        position="right"
        style={{ width: 500 }}
        disableDismiss
        aria-labelledby={id}
      >
        <StackLayout>
          <H2 id={id}>Add your delivery details</H2>
          <FormField>
            <FormFieldLabel>House no.</FormFieldLabel>
            <Input />
          </FormField>
          <FormField>
            <FormFieldLabel>Street name</FormFieldLabel>
            <Input />
          </FormField>
          <FormField>
            <FormFieldLabel>Postcode</FormFieldLabel>
            <ComboBox
              onChange={handleChange}
              onSelectionChange={handleSelectionChange}
              value={value}
              placeholder="Postcode"
            >
              {postcodes.map((postcode) => (
                <Option value={postcode} key={postcode}>
                  {postcode}
                </Option>
              ))}
            </ComboBox>
            <FormFieldHelperText>Do not include space</FormFieldHelperText>
          </FormField>
          <FormField>
            <FormFieldLabel>City/Town</FormFieldLabel>
            <Input />
          </FormField>
          <FormField>
            <FormFieldLabel>Country</FormFieldLabel>
            <Input />
          </FormField>
          <FormField>
            <Checkbox label="Dog(s) present at my property" />
          </FormField>
          <FlexItem align="end">
            <Button onClick={handleClose}>Submit</Button>
          </FlexItem>
        </StackLayout>
      </Drawer>
    </>
  );
};
