import {
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Overlay,
  OverlayPanel,
  OverlayPanelCloseButton,
  OverlayPanelContent,
  type OverlayProps,
  OverlayTrigger,
  StackLayout,
  Tooltip,
  useId,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import { type ChangeEvent, useState } from "react";

import "./overlay.stories.css";

export default {
  title: "Core/Overlay",
} as Meta<typeof Overlay>;

export const Default: StoryFn<OverlayProps> = ({ ...args }) => {
  const id = useId();

  return (
    <Overlay {...args}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>

      <OverlayPanel aria-labelledby={id}>
        <OverlayPanelContent>
          <h3 id={id} className="content-heading">
            Title
          </h3>
          <div>Content of Overlay</div>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};

export const Bottom = Default.bind({});
Bottom.args = {
  placement: "bottom",
};

export const Left = Default.bind({});
Left.args = {
  placement: "left",
};

export const Right = Default.bind({});
Right.args = {
  placement: "right",
};

export const CloseButton = ({ onOpenChange }: OverlayProps) => {
  const [open, setOpen] = useState(false);
  const id = useId();

  const onChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleClose = () => setOpen(false);

  return (
    <Overlay open={open} onOpenChange={onChange}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel aria-labelledby={id}>
        <OverlayPanelCloseButton onClick={handleClose} />
        <OverlayPanelContent>
          <h3 id={id} className="content-heading">
            Title
          </h3>
          <div>
            Content of Overlay
            <br />
            <br />
            <Tooltip content={"I'm a tooltip"}>
              <Button>hover me</Button>
            </Tooltip>
          </div>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};

export const LongContent = () => {
  const [open, setOpen] = useState(false);

  const onOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleClose = () => setOpen(false);
  return (
    <Overlay placement="right" open={open} onOpenChange={onOpenChange}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel
        style={{
          width: 300,
        }}
      >
        <OverlayPanelCloseButton onClick={handleClose} />
        <OverlayPanelContent style={{ height: 200 }}>
          <StackLayout>
            <div>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book.
            </div>
            <div>
              It has survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was
              popularised in the 1960s with the release of Letraset sheets
              containing Lorem Ipsum passages, and more recently with desktop
              publishing software like Aldus PageMaker including versions of
              Lorem Ipsum.
            </div>
          </StackLayout>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
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
  id: string | undefined;
}) => {
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
      <h3 id={id} style={{ marginTop: 0 }}>
        Export
      </h3>
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
        <Button
          style={{ float: "right", marginRight: 2 }}
          onClick={handleExport}
        >
          Export
        </Button>
      </StackLayout>
    </>
  );
};

export const WithActions = ({ onOpenChange }: OverlayProps) => {
  const [open, setOpen] = useState(false);
  const id = useId();

  const onChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <Overlay open={open} onOpenChange={onChange} placement="bottom">
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel
        style={{
          width: 246,
        }}
        aria-labelledby={id}
      >
        <OverlayPanelContent>
          <WithActionsContent
            onClose={() => {
              setOpen(false);
            }}
            id={id}
          />
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
