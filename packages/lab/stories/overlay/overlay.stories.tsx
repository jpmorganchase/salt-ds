import { Button, StackLayout, Tooltip } from "@salt-ds/core";
import { Overlay } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";

import "./overlay.stories.css";

export default {
  title: "Lab/Overlay",
  component: Overlay,
} as Meta<typeof Overlay>;

const OverlayContent = (
  <>
    <h3 className="content-heading">Title</h3>
    <div className="content-body">Content of Overlay</div>
    <br />
    <Tooltip content={"im a tooltip"}>
      <Button>hover me</Button>
    </Tooltip>
  </>
);

const OverlayTemplate: StoryFn<typeof Overlay> = (props) => {
  return (
    <Overlay {...props} content={props.content}>
      <Button>Toggle Overlay</Button>
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
    <StackLayout>
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        paddingTop: 8,
        paddingBottom: 8,
      }}
    >
      <div
        style={{
          borderBottom: "1px solid rgba(0, 0, 0, 0.15)",
          width: "100%",
        }}
      />
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

const WithActionsContent = () => {
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

  return (
    <>
      <h3 style={{ marginTop: 0 }}>Export</h3>
      <Checkbox indeterminate label="1 of 2 selected" onChange={handleChange} />
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
      <Button style={{ float: "right" }}>Export</Button>
    </>
  );
};

export const WithActions = OverlayTemplate.bind({});
WithActions.args = {
  placement: "bottom",
  style: {
    width: 246,
  },
  content: <WithActionsContent />,
};

