import {
  Button,
  Checkbox,
  CheckboxGroup,
  StackLayout,
  Tooltip,
} from "@salt-ds/core";
import { Meta } from "@storybook/react";
import React, { ChangeEvent } from "react";

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

const OverlayTemplate = (props: OverlayProps) => {
  const { placement, style, ...rest } = props;

  return (
    <Overlay placement={placement} {...rest}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel
        aria-labelledby="overlay_label"
        aria-describedby="overlay_description"
        style={style}
      >
        {OverlayContent}
      </OverlayPanel>
    </Overlay>
  );
};

export const Default = (props: OverlayProps) => {
  return OverlayTemplate({ ...props });
};

export const Bottom = (props: OverlayProps) => {
  return OverlayTemplate({ placement: "bottom", ...props });
};

export const Left = (props: OverlayProps) => {
  return OverlayTemplate({ placement: "left", ...props });
};

export const Right = (props: OverlayProps) => {
  return OverlayTemplate({ placement: "right", ...props });
};

export const LongContent = () => {
  return (
    <Overlay placement="right">
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel
        aria-labelledby="overlay_label"
        aria-describedby="overlay_description"
        style={{
          width: 300,
          height: 200,
          overflow: "auto",
        }}
      >
        <StackLayout id="overlay_description">
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
      <Button style={{ float: "right", marginRight: 2 }} onClick={handleExport}>
        Export
      </Button>
    </>
  );
};

export const WithActions = () => {
  const [show, setShow] = React.useState(false);

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
        aria-labelledby="overlay_label"
        aria-describedby="overlay_description"
        style={{
          width: 246,
        }}
      >
        {WithActionsContent({
          onClose: () => {
            setShow(false);
          },
        })}
      </OverlayPanel>
    </Overlay>
  );
};
