import { ReactElement, useState } from "react";
import { DropdownNext, DropdownNextProps, Option } from "@salt-ds/lab";
import { GB, US } from "@salt-ds/countries";

const countries: Record<string, { icon: JSX.Element; name: string }> = {
  GB: {
    icon: <GB aria-hidden size={0.75} />,
    name: "United Kingdom of Great Britain and Northern Ireland",
  },
  US: {
    icon: <US aria-hidden size={0.75} />,
    name: "United States of America",
  },
};

export const ComplexOptions = (): ReactElement => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectionChange: DropdownNextProps["onSelectionChange"] = (
    event,
    newSelected
  ) => {
    setSelected(newSelected);
  };

  const adornment = countries[selected[0] ?? ""]?.icon || null;

  return (
    <DropdownNext
      selected={selected}
      startAdornment={adornment}
      onSelectionChange={handleSelectionChange}
      style={{ width: "266px" }}
      valueToString={(item) => countries[item].name}
    >
      <Option value="GB">
        <GB size={0.75} aria-hidden /> United Kingdom of Great Britain and
        Northern Ireland
      </Option>
      <Option value="US">
        <US size={0.75} aria-hidden /> United States of America
      </Option>
    </DropdownNext>
  );
};
