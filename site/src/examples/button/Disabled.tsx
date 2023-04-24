import { Button } from "@salt-ds/core";
import { ComponentExampleType } from "../../components";

const exampleCopy = {
  title: "Disabled",
  description: "Indicates a button that the user can’t interact with.",
};

const DisabledExample = () => (
  <>
    <Button variant="primary" disabled>
      Disabled
    </Button>
    <Button variant="primary" disabled focusableWhenDisabled>
      Focusable when disabled
    </Button>
  </>
);

export const Disabled: ComponentExampleType = {
  example: DisabledExample,
  copy: exampleCopy,
};
