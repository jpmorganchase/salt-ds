import { Button } from "@salt-ds/core";
import { SearchIcon, SendIcon, SettingsSolidIcon } from "@salt-ds/icons";
import { ComponentExampleType } from "../../components";

const exampleCopy = {
  title: "Icon only",
  description:
    "Display an icon-only button with no label when you have limited on-screen space and the icon is globally understood.",
};

const IconOnlyExample = () => (
  <>
    <Button variant="cta">
      <SendIcon />
    </Button>
    <Button variant="primary">
      <SearchIcon />
    </Button>
    <Button variant="primary">
      <SettingsSolidIcon />
    </Button>
  </>
);

export const IconOnly: ComponentExampleType = {
  example: IconOnlyExample,
  copy: exampleCopy,
};
