import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Dropdown,
  FlowLayout,
  FormField,
  FormFieldLabel,
  H3,
  Option,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
} from "@salt-ds/core";
import { HeaderBlock } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const InDialog = (): ReactElement => {
  const [open, setOpen] = useState(true);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Open dialog
      </Button>
      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
        id="header-block-dialog"
      >
        <HeaderBlock
          accent={true}
          preheader="Account conversation"
          header="Edit details"
          onClose={handleClose}
        />
        <DialogContent>
          <StackLayout gap={1}>
            <H3>Product details</H3>
            <p>
              Collateral Agreement Unified Doc ID is required when counterparty
              type is 04 or 07.
            </p>
            <FlowLayout>
              <FormField>
                <FormFieldLabel>Product type</FormFieldLabel>
                <RadioButtonGroup>
                  <RadioButton
                    label="Checking"
                    value="checking"
                    checked={true}
                  />
                  <RadioButton label="Saving" value="saving" />
                </RadioButtonGroup>
              </FormField>
              <FormField>
                <FormFieldLabel>Product name</FormFieldLabel>
                <Dropdown selected={["028 - Commercial checking"]}>
                  <Option
                    value="028 - Commercial checking"
                    key={"028 - Commercial checking"}
                  />
                </Dropdown>
              </FormField>
            </FlowLayout>
          </StackLayout>
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleClose}>Previous</Button>
          <Button variant="cta" onClick={handleClose}>
            Next
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
