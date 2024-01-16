import { ReactElement, useState } from "react";
import { DropdownNext, DropdownNextProps, Option } from "@salt-ds/lab";
import { GB, US } from "@salt-ds/countries";

const adornmentMap: Record<string, JSX.Element> = {
  GB: <GB aria-hidden size={0.75} />,
  US: <US aria-hidden size={0.75} />,
};

export const ComplexOptions = (): ReactElement => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectionChange: DropdownNextProps["onSelectionChange"] = (
    event,
    newSelected
  ) => {
    setSelected(newSelected);
  };

  const adornment = adornmentMap[selected[0] ?? ""] || null;

  return (
    <DropdownNext
      selected={selected}
      startAdornment={adornment}
      onSelectionChange={handleSelectionChange}
      style={{ width: "266px" }}
    >
      <Option
        value="GB"
        textValue="United Kingdom of Great Britain and Northern Ireland"
      >
        <GB size={0.75} aria-hidden /> United Kingdom of Great Britain and
        Northern Ireland
      </Option>
      <Option value="US" textValue="United States of America">
        <US size={0.75} aria-hidden /> United States of America
      </Option>
    </DropdownNext>
  );
};
