import {
  Dropdown,
  type DropdownProps,
  Option,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { EditIcon, GuideClosedIcon, UserAdminIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

type Permission = {
  icon: JSX.Element;
  name: string;
  description: string;
};

const permissions: Record<string, Permission> = {
  read: {
    icon: <GuideClosedIcon aria-hidden />,
    name: "Read",
    description: "Read only",
  },
  write: {
    icon: <EditIcon aria-hidden />,
    name: "Write",
    description: "Read and write only",
  },
  admin: {
    icon: <UserAdminIcon aria-hidden />,
    name: "Admin",
    description: "Full access",
  },
};

export const ComplexOptions = (): ReactElement => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectionChange: DropdownProps["onSelectionChange"] = (
    _event,
    newSelected,
  ) => {
    setSelected(newSelected);
  };

  const adornment = permissions[selected[0] ?? ""]?.icon || null;

  return (
    <Dropdown
      selected={selected}
      startAdornment={adornment}
      onSelectionChange={handleSelectionChange}
      style={{ width: "133px" }}
      valueToString={(item) => permissions[item].name}
    >
      {Object.values(permissions).map(({ name, icon, description }) => (
        <Option value={name.toLowerCase()} key={name.toLowerCase()}>
          <StackLayout direction="row" gap={1}>
            {icon}
            <StackLayout gap={0.5} align="start">
              <Text>{name}</Text>
              <Text styleAs="label" color="secondary">
                {description}
              </Text>
            </StackLayout>
          </StackLayout>
        </Option>
      ))}
    </Dropdown>
  );
};
