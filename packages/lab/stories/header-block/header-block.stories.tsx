import {
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormField,
  FormFieldLabel,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  type OverlayProps,
  OverlayTrigger,
  StackLayout,
  Tooltip,
  Drawer,
  RadioButton,
  RadioButtonGroup,
  type DrawerProps,
} from "@salt-ds/core";
import { HeaderBlock } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Lab/Header Block",
  component: Dialog,
} as Meta<typeof Dialog>;

export const Default: StoryFn<typeof Dialog> = () => {
  const [padding, setPadding] = useState("300");
  const handlePadding = (padding: "100" | "200" | "300") => {
    setPadding(padding);
  };
  const [accent, setAccent] = useState(true);
  const handleAccent = () => {
    setAccent(!accent);
  };
  return (
    <StackLayout direction="row" align="center">
      <StackLayout>
        <FormField>
          <FormFieldLabel>Padding</FormFieldLabel>
          <RadioButtonGroup>
            <RadioButton
              label="100"
              value="100"
              checked={padding === "100"}
              onChange={() => handlePadding("100")}
            />
            <RadioButton
              label="200"
              value="200"
              checked={padding === "200"}
              onChange={() => handlePadding("200")}
            />
            <RadioButton
              label="300"
              value="300"
              checked={padding === "300"}
              onChange={() => handlePadding("300")}
            />
          </RadioButtonGroup>
        </FormField>
        <Checkbox
          label="Accent"
          value="1"
          checked={accent}
          onChange={handleAccent}
        />
      </StackLayout>
      <StackLayout>
        <Card style={{ position: "relative", width: "512px", padding: 0 }}>
          <HeaderBlock
            header="Header Block"
            onClose={() => {}}
            accent={accent}
            padding={padding as "200" | "300"}
          />
        </Card>
        <Card style={{ position: "relative", width: "512px", padding: 0 }}>
          <HeaderBlock
            accent={accent}
            padding={padding as "200" | "300"}
            header="A Header Block with a preheader and a description."
            preheader="This is a preheader."
            description="This is a description."
            onClose={() => {}}
          />
        </Card>
        <Card style={{ position: "relative", width: "512px", padding: 0 }}>
          <HeaderBlock
            padding={padding as "200" | "300"}
            accent={accent}
            status="success"
            header="Status: success"
            onClose={() => {}}
          />
        </Card>
      </StackLayout>
    </StackLayout>
  );
};

export const Accent: StoryFn<typeof Dialog> = () => {
  return (
    <StackLayout>
      <Card style={{ position: "relative", width: "512px", padding: 0 }}>
        <HeaderBlock
          accent={true}
          header="A Header Block with a preheader and a description."
          preheader="This is a preheader."
          description="This is a description."
          onClose={() => {}}
        />
      </Card>
      <Card style={{ position: "relative", width: "512px", padding: 0 }}>
        <HeaderBlock
          accent={true}
          header="A Header Block with a preheader and a description."
          preheader="This is a preheader."
          onClose={() => {}}
        />
      </Card>
      <Card style={{ position: "relative", width: "512px", padding: 0 }}>
        <HeaderBlock
          accent={true}
          header="A Header Block with a preheader and a description."
          description="This is a description."
          onClose={() => {}}
        />
      </Card>
      <Card style={{ position: "relative", width: "512px", padding: 0 }}>
        <HeaderBlock header="Header Block" onClose={() => {}} accent={true} />
      </Card>
    </StackLayout>
  );
};

export const NoAccent: StoryFn<typeof Dialog> = () => {
  return (
    <StackLayout>
      <Card style={{ position: "relative", width: "512px", padding: 0 }}>
        <HeaderBlock
          header="A Header Block with a preheader and a description."
          preheader="This is a preheader."
          description="This is a description."
          onClose={() => {}}
        />
      </Card>
      <Card style={{ position: "relative", width: "512px", padding: 0 }}>
        <HeaderBlock
          header="A Header Block with a preheader and a description."
          preheader="This is a preheader."
          onClose={() => {}}
        />
      </Card>
      <Card style={{ position: "relative", width: "512px", padding: 0 }}>
        <HeaderBlock
          header="A Header Block with a preheader and a description."
          description="This is a description."
          onClose={() => {}}
        />
      </Card>
      <Card style={{ position: "relative", width: "512px", padding: 0 }}>
        <HeaderBlock header="Header Block" onClose={() => {}} />
      </Card>
    </StackLayout>
  );
};

export const Status: StoryFn<typeof Dialog> = () => {
  return (
    <StackLayout>
      <Card style={{ position: "relative", width: "512px", padding: 0 }}>
        <HeaderBlock status="info" header="Status: info" onClose={() => {}} />
      </Card>
      <Card style={{ position: "relative", width: "512px", padding: 0 }}>
        <HeaderBlock
          status="success"
          header="Status: success"
          onClose={() => {}}
        />
      </Card>
      <Card style={{ position: "relative", width: "512px", padding: 0 }}>
        <HeaderBlock
          status="warning"
          header="Status: warning"
          onClose={() => {}}
        />
      </Card>
      <Card style={{ position: "relative", width: "512px", padding: 0 }}>
        <HeaderBlock status="error" header="Status: error" onClose={() => {}} />
      </Card>
    </StackLayout>
  );
};

export const InDialog: StoryFn<typeof Dialog> = () => {
  const [open, setOpen] = useState(true);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Open dialog
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange} id="header-block-dialog">
        <HeaderBlock
          accent={true}
          header="Congratulations! You have created a Dialog."
          onClose={() => onOpenChange(false)}
        />
        <DialogContent>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book.
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleClose}>Previous</Button>
          <Button variant="cta" onClick={handleClose}>
            Next
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const InOverlay = ({ onOpenChange }: OverlayProps) => {
  const [open, setOpen] = useState(true);

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
      <OverlayPanel
        aria-labelledby="header-block-overlay"
        style={{
          width: 500,
        }}
      >
        <HeaderBlock header="Title" onClose={handleClose} padding="100" />
        <OverlayPanelContent>
          <div>
            Content of Overlay. Lorem Ipsum is simply dummy text of the printing
            and typesetting industry. Lorem Ipsum has been the industry's
            standard dummy text ever since the 1500s. When an unknown printer
            took a galley of type and scrambled it to make a type specimen book.
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

export const InOverlayWithLongContent = () => {
  const [open, setOpen] = useState(true);

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
        <HeaderBlock onClose={handleClose} padding="100" />
        <OverlayPanelContent
          style={{
            height: 200,
            overflow: "auto",
          }}
        >
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
