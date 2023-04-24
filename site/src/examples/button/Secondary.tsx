import { Button } from "@salt-ds/core";
import { ComponentExampleType } from "../../components";

const exampleCopy = {
  title: "Secondary",
  description:
    "Use the secondary button for non-critical actions that support the user but do not impact a flow.",
};

const SecondaryExample = () => (
  <Button variant="secondary">Secondary Button</Button>
);

export const Secondary: ComponentExampleType = {
  example: SecondaryExample,
  copy: exampleCopy,
};
