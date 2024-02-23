import {
  Button,
  Checkbox,
  CheckboxGroup,
  StackLayout,
  Tooltip,
  Overlay,
  OverlayPanel,
  OverlayProps,
  OverlayTrigger,
} from "@salt-ds/core";
import { Meta } from "@storybook/react";
import React, { ChangeEvent } from "react";

import "./overlay.stories.css";

export default {
  title: "Core/Overlay",
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

const OverlayTemplate = (props: OverlayProps) => {
  const { style, id, ...rest } = props;

  return (
    <Overlay id={id} {...rest}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel style={style}>
        <OverlayContent id={id ?? ""} />
      </OverlayPanel>
    </Overlay>
  );
};

export const Default = (props: OverlayProps) => {
  return OverlayTemplate({ id: "overlay-default", ...props });
};

export const Bottom = (props: OverlayProps) => {
  return OverlayTemplate({
    id: "overlay-bottom",
    placement: "bottom",
    ...props,
  });
};

export const Left = (props: OverlayProps) => {
  return OverlayTemplate({ id: "overlay-left", placement: "left", ...props });
};

export const Right = (props: OverlayProps) => {
  return OverlayTemplate({ id: "overlay-right", placement: "right", ...props });
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

export const WithActions = () => {
  const [show, setShow] = React.useState(false);
  const id = "overlay-with-actions";

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
