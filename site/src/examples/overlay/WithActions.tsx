import {
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Overlay,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
  useId,
} from "@salt-ds/core";
import { type ChangeEvent, useState } from "react";

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

interface WithActionsContentProps {
  id?: string;
  onClose: () => void;
}

const WithActionsContent = ({ id, onClose }: WithActionsContentProps) => {
  const [controlledValues, setControlledValues] = useState([
    checkboxesData[0].value,
  ]);

  const [checkboxState, setCheckboxState] = useState({
    checked: false,
    indeterminate: true,
  });

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
    onClose();
  };

  return (
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
      <Button style={{ float: "right", marginRight: 2 }} onClick={handleExport}>
        Export
      </Button>
    </StackLayout>
  );
};

export const WithActions = () => {
  const [open, setOpen] = useState(false);
  const id = useId();

  const onOpenChange = (newOpen: boolean) => setOpen(newOpen);

  return (
    <Overlay open={open} onOpenChange={onOpenChange} placement="bottom">
      <OverlayTrigger>
        <Button
          onClick={() => {
            setOpen(true);
          }}
        >
          Show Overlay
        </Button>
      </OverlayTrigger>
      <OverlayPanel
        style={{
          width: 246,
        }}
        aria-labelledby={id}
      >
        <OverlayHeader id={id} header="Export" />
        <OverlayPanelContent>
          <WithActionsContent
            id={id}
            onClose={() => {
              setOpen(false);
            }}
          />
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
