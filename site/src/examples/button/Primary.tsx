import { Button } from "@salt-ds/core";
import { ComponentExampleType } from "../../components";

const exampleCopy = {
  title: "Primary",
  description: "Use the primary button for routine, non-urgent actions.",
};

const PrimaryExample = () => <Button variant="primary">Primary Button</Button>;

export const Primary: ComponentExampleType = {
  example: PrimaryExample,
  copy: exampleCopy,
};
