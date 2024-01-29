import { ChangeEvent, ReactElement, SyntheticEvent, useState } from "react";
import { ComboBoxNext, Drawer, Option } from "@salt-ds/lab";
import {
  Button,
  Checkbox,
  FlexItem,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
  H2,
} from "@salt-ds/core";

export const MandatoryAction = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const postcodes = ["05011", "01050", "03040", "11050"];
  const id = "right-drawer";

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
    event: SyntheticEvent,
    newSelected: string[]
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
        id={id}
        disableDismiss
      >
        <StackLayout>
          <H2 id={`${id}-header`}>Add your delivery details</H2>
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
            <ComboBoxNext
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
            </ComboBoxNext>
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
