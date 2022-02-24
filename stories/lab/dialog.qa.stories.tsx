import { FC } from "react";
import { ToolkitProvider, useDensity } from "@brandname/core";
import {
  ButtonBar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  OrderedButton,
} from "@brandname/lab";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { QAContainer } from "../components";
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

type BasicDialogExampleProps = Pick<DialogProps, "state">;

const BasicDialogExample: FC<BasicDialogExampleProps> = ({ state }) => {
  const density = useDensity();
  const densityBreakpoint = density === "touch" ? "xl" : "xs";

  return (
    <div>
      <Dialog
        open
        width={densityDialogWidths[density]}
        state={state}
        disablePortal={true}
      >
        <DialogTitle>Controlled Dialog:</DialogTitle>
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
    </div>
  );
};

const BasicDialog = () => <BasicDialogExample state={"info"} />;
const ErrorDialog = () => <BasicDialogExample state={"error"} />;
const WarningDialog = () => <BasicDialogExample state={"warning"} />;
const SuccessDialog = () => <BasicDialogExample state={"success"} />;

export const CompareWithOriginalToolkit: ComponentStory<typeof Dialog> = () => {
  return (
    <QAContainer
      className="uitkDialogQA"
      imgSrc="/visual-regression-screenshots/Dialog-vr-snapshot.png"
    >
      <div className={"container"}>
        <ToolkitProvider density={"high"} theme={"light"}>
          <BasicDialog />
        </ToolkitProvider>
        <ToolkitProvider density={"medium"} theme={"dark"}>
          <ErrorDialog />
        </ToolkitProvider>
        <ToolkitProvider density={"low"} theme={"light"}>
          <WarningDialog />
        </ToolkitProvider>
        <ToolkitProvider density={"touch"} theme={"dark"}>
          <SuccessDialog />
        </ToolkitProvider>
      </div>
    </QAContainer>
  );
};
