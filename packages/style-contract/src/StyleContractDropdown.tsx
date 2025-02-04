import React, { forwardRef } from "react";
import {
  Dropdown,
  DropdownProps,
  Option,
  OptionGroup,
} from "@salt-ds/core";
import { StyleContract } from "./StyleContract";
import { useStyleContract } from './StyleContractProvider';

import { z, ZodSchema } from "zod";

export interface Contracts<T extends ZodSchema<any>> {
  owner: string;
  contracts: StyleContract<T>[];
}

interface StyleContractDropdownOption<T extends ZodSchema<any>> {
  owner: string;
  contract: z.infer<T>;
}

interface StyleContractDropdownProps<T extends ZodSchema<any>>
  extends DropdownProps<StyleContractDropdownOption<T> | null> {
  contracts: Contracts<T>[];
}

const SALT_DEFAULT_OPTION = "Salt default";

const capitalizeFirstLetter = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);

export const StyleContractDropdown = forwardRef<
  HTMLButtonElement,
  StyleContractDropdownProps<any>
>(function StyleContractDropdown<T extends ZodSchema<any>>(
  {
    contracts,
    ...rest
  }: React.PropsWithChildren<StyleContractDropdownProps<T>>,
  ref: React.Ref<HTMLButtonElement>,
) {
  const { setContract } = useStyleContract();

  const handleSelectionChange: DropdownProps<StyleContractDropdownOption<T> | null>["onSelectionChange"] =
    (_event, newSelected) => {
      const selectedOption = newSelected[0];
      if (!selectedOption) {
        setContract(null);
        return;
      }
      setContract(selectedOption.contract);
    };

  const formatValue = (value: StyleContractDropdownOption<T> | null) => {
    if (!value) {
      return SALT_DEFAULT_OPTION;
    }
    const { owner, contract } = value;
    return `${capitalizeFirstLetter(owner)} - ${capitalizeFirstLetter(contract.name)}`;
  };

  return (
    <Dropdown
      ref={ref}
      defaultSelected={[null]}
      onSelectionChange={handleSelectionChange}
      valueToString={formatValue}
      {...rest}
    >
      <Option key="__salt_style_contract_none" value={null}>
        {SALT_DEFAULT_OPTION}
      </Option>
      {contracts.map(({ owner, contracts:contractItems }) => (
        <OptionGroup key={owner} label={capitalizeFirstLetter(owner)}>
          {contractItems.map((contract) => (
            <Option key={contract.name} value={{ owner, contract }}>
              {capitalizeFirstLetter(contract.name)}
            </Option>
          ))}
        </OptionGroup>
      ))}
    </Dropdown>
  );
});
