import {
  Button,
  Checkbox,
  CheckboxGroup,
  StackLayout,
  Tooltip,
} from "@salt-ds/core";
import React, { ChangeEvent } from "react";
import { StoryFn, Meta } from "@storybook/react";

import {
  Overlay,
  OverlayPanel,
  OverlayProps,
  OverlayTrigger,
} from "@salt-ds/lab";

import "./overlay.stories.css";

export default {
  title: "Lab/Overlay",
  component: Overlay,
} as Meta<typeof Overlay>;

const OverlayContent = ({ id }: { id: string }) => {
  return (
    <>
      <h3 id={`${id}-header`} className="content-heading">
        Title
      </h3>
      <div id={`${id}-content`}>
        Content of Overlay
        <br />
        <br />
        <Tooltip content={"im a tooltip"}>
          <Button>hover me</Button>
        </Tooltip>
      </div>
    </>
  );
};

export const Default: StoryFn<OverlayProps> = ({ id, ...args }) => {
  return (
    <Overlay id={id} {...args}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel>
        <OverlayContent id={id ?? ""} />
      </OverlayPanel>
    </Overlay>
  );
};

export const Bottom = Default.bind({});
Bottom.args = {
  id: "overlay-bottom",
  placement: "bottom",
};

export const Left = Default.bind({});
Left.args = {
  id: "overlay-left",
  placement: "left",
};

export const Right = Default.bind({});
Right.args = {
  id: "overlay-right",
  placement: "right",
};

export const LongContent = () => {
  const id = "overlay-long-content";

  return (
    <Overlay id={id} placement="right">
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel
        style={{
          width: 300,
          height: 200,
          overflow: "auto",
        }}
      >
        <StackLayout id={`${id}-content`}>
          <div>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book.
          </div>
          <div>
            It has survived not only five centuries, but also the leap into
            electronic typesetting, remaining essentially unchanged. It was
            popularised in the 1960s with the release of Letraset sheets
            containing Lorem Ipsum passages, and more recently with desktop
            publishing software like Aldus PageMaker including versions of Lorem
            Ipsum.
          </div>
        </StackLayout>
      </OverlayPanel>
    </Overlay>
  );
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
      <h3 id={`${id}-header`} style={{ marginTop: 0 }}>
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

export const WithActions = ({ onOpenChange }: OverlayProps) => {
  const [open, setOpen] = React.useState(false);
  const id = "overlay-with-actions";

  const onChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <Overlay open={open} onOpenChange={onChange} placement="bottom" id={id}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel
        style={{
          width: 246,
        }}
      >
        <WithActionsContent
          onClose={() => {
            setOpen(false);
          }}
          id={id}
        />
      </OverlayPanel>
    </Overlay>
  );
};
