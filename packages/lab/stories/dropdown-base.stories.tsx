import { useState } from "react";
import { Button } from "@jpmorganchase/uitk-core";
import {
  DropdownBase,
  DropdownBaseProps,
  DropdownButton,
} from "@jpmorganchase/uitk-lab";

import { Story } from "@storybook/react";

export default {
  title: "Lab/DropdownBase",
  component: DropdownBase,
};

export const DefaultDropdown: Story<DropdownBaseProps> = () => {
  const handleChange = (isOpen: boolean) => {
    console.log("isOpen changed", isOpen);
  };

  const callbackRef = (el: HTMLDivElement) => {
    console.log(`ref on Button set to ${el.className}`);
  };
  return (
    <div style={{ display: "flex", gap: 20 }}>
      <DropdownBase onOpenChange={handleChange} style={{ width: 180 }}>
        <DropdownButton label="Bottom Start " ref={callbackRef} />
        <div style={{ backgroundColor: "red", width: 200, height: 100 }} />
      </DropdownBase>
      <DropdownBase
        onOpenChange={handleChange}
        placement="bottom-end"
        style={{ width: 180 }}
      >
        <DropdownButton label="Bottom End" />
        <div style={{ backgroundColor: "red", width: 200, height: 100 }} />
      </DropdownBase>
    </div>
  );
};

export const ControlledDropdown: Story<DropdownBaseProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleChange: DropdownBaseProps["onOpenChange"] = (open: boolean) => {
    setIsOpen(open);
  };

  const showDropdown = () => {
    setIsOpen(true);
  };
  const hideDropdown = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={showDropdown}>Show</Button>
      <Button onClick={hideDropdown}>Hide</Button>
      <DropdownBase
        onOpenChange={handleChange}
        isOpen={isOpen}
        style={{ width: 180 }}
      >
        <DropdownButton label="Click Here" />
        <div style={{ backgroundColor: "red", width: 200, height: 100 }} />
      </DropdownBase>
    </>
  );
};
