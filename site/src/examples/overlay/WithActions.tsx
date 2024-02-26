import { ChangeEvent } from "react";

import {
  Button,
  CheckboxGroup,
  Checkbox,
  Overlay,
  OverlayPanel,
  OverlayTrigger,
  useId
} from "@salt-ds/core";
import React from "react";
import styles from "./index.module.css";

const Divider = () => {
  return (
    <div className={styles.dividerContainer}>
      <div className={styles.divider} />
    </div>
  );
};

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

const WithActionsContent = ({
  onClose,
  id,
}: {
  onClose: () => void;
  id: string;
}) => {
  const [controlledValues, setControlledValues] = React.useState([
    checkboxesData[0].value,
  ]);

  const [checkboxState, setCheckboxState] = React.useState({
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
          (controlledValue) => controlledValue !== value
        )
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
      <h3 id={`${id}-header`} style={{ marginTop: 0, paddingBottom: 10 }}>
        Export
      </h3>
      <div id={`${id}-content`}>
        <Checkbox
          indeterminate={indeterminate}
          checked={!indeterminate}
          label={`${controlledValues.length} of 2 selected`}
          onChange={handleChange}
        />
        <Divider />
        <CheckboxGroup
          checkedValues={controlledValues}
          onChange={handleGroupChange}
        >
          {checkboxesData.map((data) => (
            <Checkbox key={data.value} {...data} />
          ))}
        </CheckboxGroup>
        <Divider />
        <Button
          style={{ float: "right", marginRight: 2 }}
          onClick={handleExport}
        >
          Export
        </Button>
      </div>
    </>
  );
};

export const WithActions = () => {
  const [show, setShow] = React.useState(false);
  const id = useId()

  return (
    <Overlay
      open={show}
      onClose={() => {
        setShow(false);
      }}
      onKeyDown={(event) => {
        event.key === "Escape" && setShow(false);
      }}
      placement="bottom"
      id={id}
    >
      <OverlayTrigger>
        <Button
          onClick={() => {
            setShow(true);
          }}
        >
          Show Overlay
        </Button>
      </OverlayTrigger>
      <OverlayPanel
        style={{
          width: 246,
        }}
      >
        <WithActionsContent
          onClose={() => {
            setShow(false);
          }}
          id={id}
        />
      </OverlayPanel>
    </Overlay>
  );
};
