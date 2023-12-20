import { ChangeEvent } from "react";

import { Overlay, useOverlay } from "@salt-ds/lab";
import { Button, CheckboxGroup, Checkbox } from "@salt-ds/core";
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

const WithActionsContent = ({ onClose }: { onClose: () => void }) => {
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

  const getStatus = () => {
    return controlledValues.length <= 1 ? true : false;
  };

  const handleExport = () => {
    console.log(`${controlledValues.length} file(s) exported`);
    onClose();
  };

  return (
    <>
      <h3 style={{ marginBottom: 12 }} id="overlay_label">
        Export
      </h3>
      <Checkbox
        indeterminate={getStatus()}
        checked={!getStatus()}
        label={`${controlledValues.length} of 2 selected`}
        onChange={handleChange}
        id="overlay_description"
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
      <Button style={{ float: "right", marginRight: 2 }} onClick={handleExport}>
        Export
      </Button>
    </>
  );
};

export const WithActions = () => {
  const [show, setShow] = React.useState(false);
  const { onOpenChange } = useOverlay({ onOpenChange: setShow });

  return (
    <Overlay
      open={show}
      content={
        <WithActionsContent
          onClose={() => {
            setShow(false);
          }}
        />
      }
      onClose={() => {
        setShow(false);
      }}
      placement="bottom"
      style={{
        width: 246,
      }}
      onOpenChange={onOpenChange}
      onKeyDown={(event) => {
        event.key === "Escape" && setShow(false);
      }}
      aria-labelledby="overlay_label"
      aria-describedby="overlay_description"
    >
      <Button
        onClick={() => {
          setShow(true);
        }}
        onKeyDown={(event) => {
          event.key === "Escape" && setShow(false);
        }}
      >
        Show Overlay
      </Button>
    </Overlay>
  );
};
