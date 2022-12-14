import { ToolkitProvider, useDensity } from "@salt-ds/core";
import {
  ButtonBar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  OrderedButton,
} from "@salt-ds/lab";
import { ComponentMeta, Story } from "@storybook/react";
import "./dialog.qa.stories.css";

export default {
  title: "Lab/Dialog/QA",
  component: Dialog,
} as ComponentMeta<typeof Dialog>;

const densityDialogWidths = {
  touch: 640,
  low: 600,
  medium: 500,
  high: 500,
};

type BasicDialogExampleProps = Pick<DialogProps, "status">;

const BasicDialogExample = ({ status }: BasicDialogExampleProps) => {
  const density = useDensity();
  const densityBreakpoint = density === "touch" ? "xl" : "xs";

  return (
    <Dialog
      open
      width={densityDialogWidths[density]}
      status={status}
      disablePortal={true}
    >
      <DialogTitle>Controlled Dialog</DialogTitle>
      <DialogContent>This is a dialog</DialogContent>
      <DialogActions>
        <ButtonBar
          className={`DialogButtonBar-${density}Density`}
          stackAtBreakpoint={densityBreakpoint}
        >
          <OrderedButton variant="cta">CTA BUTTON</OrderedButton>
          <OrderedButton style={{ cursor: "pointer" }}>
            REGULAR BUTTON
          </OrderedButton>
          <OrderedButton className="DialogButton" variant="secondary">
            SECONDARY BUTTON
          </OrderedButton>
        </ButtonBar>
      </DialogActions>
    </Dialog>
  );
};

const BasicDialog = () => <BasicDialogExample status={"info"} />;
const ErrorDialog = () => <BasicDialogExample status={"error"} />;
const WarningDialog = () => <BasicDialogExample status={"warning"} />;
const SuccessDialog = () => <BasicDialogExample status={"success"} />;

export const ExamplesGrid: Story = () => (
  <div className={"examples-container"}>
    <ToolkitProvider applyClassesTo={"child"} density={"high"} mode={"light"}>
      <div>
        <BasicDialog />
      </div>
    </ToolkitProvider>
    <ToolkitProvider applyClassesTo={"child"} density={"medium"} mode={"dark"}>
      <div>
        <ErrorDialog />
      </div>
    </ToolkitProvider>
    <ToolkitProvider applyClassesTo={"child"} density={"low"} mode={"light"}>
      <div>
        <WarningDialog />
      </div>
    </ToolkitProvider>
    <ToolkitProvider applyClassesTo={"child"} density={"touch"} mode={"dark"}>
      <div>
        <SuccessDialog />
      </div>
    </ToolkitProvider>
  </div>
);

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
