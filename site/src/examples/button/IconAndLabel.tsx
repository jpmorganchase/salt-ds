import { Button } from "@salt-ds/core";
import { SearchIcon, SendIcon } from "@salt-ds/icons";
import { ComponentExampleType } from "../../components";

const exampleCopy = {
  title: "Icon and label",
  description:
    "Add an icon before the text to reinforce the button label, or add an icon after the button label to suggest movement or a direction.",
};

const IconAndLabelExample = () => (
  <>
    <Button variant="primary">
      <SearchIcon /> Search
    </Button>
    <Button variant="cta">
      Send <SendIcon />
    </Button>
  </>
);

export const IconAndLabel: ComponentExampleType = {
  example: IconAndLabelExample,
  copy: exampleCopy,
};
