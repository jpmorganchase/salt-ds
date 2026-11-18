import {
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Overlay,
  OverlayFooter,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
} from "@salt-ds/core";
import { type ChangeEvent, type ReactElement, useState } from "react";

const checkboxesData = [
  {
    label: "Overlay",
    value: "overlay",
  },
  {
    label: "Row",
    value: "row",
  },
];

export const WithActions = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const [controlledValues, setControlledValues] = useState([
    checkboxesData[0].value,
  ]);

  const [checkboxState, setCheckboxState] = useState({
    checked: false,
    indeterminate: true,
  });

  const onOpenChange = (newOpen: boolean) => setOpen(newOpen);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updatedChecked = event.target.checked;
    setCheckboxState({
      indeterminate: !updatedChecked && checkboxState.checked,
      checked:
        checkboxState.indeterminate && updatedChecked ? false : updatedChecked,
    });
  };

  const handleGroupChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (controlledValues.indexOf(value) === -1) {
      setControlledValues((prevControlledValues) => [
        ...prevControlledValues,
        value,
      ]);
    } else {
      setControlledValues((prevControlledValues) =>
        prevControlledValues.filter(
          (controlledValue) => controlledValue !== value,
        ),
      );
    }
  };

  const indeterminate = controlledValues.length <= 1;

  const handleExport = () => {
    console.log(`${controlledValues.length} file(s) exported`);
    setOpen(false);
  };

  return (
    <Overlay open={open} onOpenChange={onOpenChange} placement="bottom">
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel
        style={{
          width: 246,
        }}
      >
        <OverlayHeader header="Export" />
        <OverlayPanelContent>
          <StackLayout gap={1}>
            <Checkbox
              indeterminate={indeterminate}
              checked={!indeterminate}
              label={`${controlledValues.length} of 2 selected`}
              onChange={handleChange}
            />
            <Divider variant="secondary" />
            <CheckboxGroup
              checkedValues={controlledValues}
              onChange={handleGroupChange}
            >
              {checkboxesData.map((data) => (
                <Checkbox key={data.value} {...data} />
              ))}
            </CheckboxGroup>
            <Divider variant="secondary" />
          </StackLayout>
        </OverlayPanelContent>
        <OverlayFooter>
          <Button
            sentiment="accented"
            onClick={handleExport}
            style={{ width: "100%" }}
          >
            Export
          </Button>
        </OverlayFooter>
      </OverlayPanel>
    </Overlay>
  );
};
