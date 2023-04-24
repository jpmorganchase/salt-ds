import { Button } from "@salt-ds/core";
import { ComponentExampleType } from "../../components";

const exampleCopy = {
  title: "CTA (call to action)",
  description: "Use the CTA button for high priority actions.",
};

const CTAExample = () => <Button variant="cta">CTA Button</Button>;

export const CTA: ComponentExampleType = {
  example: CTAExample,
  copy: exampleCopy,
};
