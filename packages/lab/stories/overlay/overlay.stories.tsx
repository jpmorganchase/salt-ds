import {
  Button,
  Checkbox,
  CheckboxGroup,
  StackLayout,
  Tooltip,
} from "@salt-ds/core";
import { Overlay, useOverlay } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import React, { ChangeEvent } from "react";

import "./overlay.stories.css";

export default {
  title: "Lab/Overlay",
  component: Overlay,
} as Meta<typeof Overlay>;

const OverlayContent = (
  <>
    <h3 id="overlay_label" className="content-heading">
      Title
    </h3>
    <div id="overlay_description">
      Content of Overlay
      <br />
      <br />
      <Tooltip content={"im a tooltip"}>
        <Button>hover me</Button>
      </Tooltip>
    </div>
  </>
);

const OverlayTemplate: StoryFn<typeof Overlay> = (props) => {
  return (
    <Overlay
      aria-labelledby="overlay_label"
      aria-describedby="overlay_description"
      {...props}
      content={props.content}
    >
      <Button>Show Overlay</Button>
    </Overlay>
  );
};

export const Default = OverlayTemplate.bind({});
Default.args = {
  placement: "top",
  content: OverlayContent,
};

export const OverlayRight = OverlayTemplate.bind({});
OverlayRight.args = {
  placement: "right",
  content: OverlayContent,
};

export const OverlayBottom = OverlayTemplate.bind({});
OverlayBottom.args = {
  placement: "bottom",
  content: OverlayContent,
};

export const OverlayLeft = OverlayTemplate.bind({});
OverlayLeft.args = {
  placement: "left",
  content: OverlayContent,
};

export const LongContent = OverlayTemplate.bind({});
LongContent.args = {
  placement: "right",
  style: {
    width: 300,
    height: 200,
    overflow: "auto",
  },
  content: (
    <StackLayout id="overlay_description">
      <div>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book.
      </div>
      <div>
        It has survived not only five centuries, but also the leap into
        electronic typesetting, remaining essentially unchanged. It was
        popularised in the 1960s with the release of Letraset sheets containing
        Lorem Ipsum passages, and more recently with desktop publishing software
        like Aldus PageMaker including versions of Lorem Ipsum.
      </div>
    </StackLayout>
  ),
};

const Divider = () => {
  return (
    <div className="divider-container">
      <div className="divider" />
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
      <h3 style={{ marginTop: 0 }} id="overlay_label">
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
      <Button style={{ float: "right", marginRight: 1 }} onClick={handleExport}>
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
      placement={"bottom"}
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
