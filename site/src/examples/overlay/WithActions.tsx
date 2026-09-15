import {
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  H3,
  Overlay,
  OverlayFooter,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
  useId,
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
    <>
      <OverlayPanelContent>
        <H3
          id={id}
          style={{ margin: 0, marginBottom: "var(--salt-spacing-100)" }}
        >
          Export
        </H3>
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
        <Button onClick={handleExport} style={{ width: "100%" }}>
          Export
        </Button>
      </OverlayFooter>
    </>
  );
};

export const WithActions = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const id = useId();

  const onOpenChange = (newOpen: boolean) => setOpen(newOpen);

  return (
    <Overlay open={open} onOpenChange={onOpenChange} placement="bottom">
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel
        style={{
          width: 246,
        }}
        aria-labelledby={id}
      >
        <WithActionsContent
          id={id}
          onClose={() => {
            setOpen(false);
          }}
        />
      </OverlayPanel>
    </Overlay>
  );
};
