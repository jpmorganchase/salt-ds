import {
  Dropdown,
  type DropdownProps,
  Option,
  OptionGroup,
} from "@salt-ds/core";
import type React from "react";
import { forwardRef } from "react";
import type { Contract, StyleContract } from "./StyleContract";
import { useStyleContract } from "./StyleContractProvider";

/**
 * Represents a collection of style contracts owned by a specific entity.
 * @template T - The type of the contract declarations.
 */
export interface Contracts<T extends Contract> {
  owner: string;
  contracts: StyleContract<T>[];
}

/**
 * Represents an option in the style contract dropdown.
 * @template T - The type of the contract declarations.
 */
interface StyleContractDropdownOption<T extends Contract> {
  owner: string;
  contract: StyleContract<T>;
}

/**
 * Props for the StyleContractDropdown component.
 * @template T - The type of the contract declarations.
 */
interface StyleContractDropdownProps<T extends Contract>
  extends DropdownProps<StyleContractDropdownOption<T> | null> {
  contracts: Contracts<T>[];
}

const SALT_DEFAULT_OPTION = "Salt default";

/**
 * Capitalizes the first letter of a word.
 * @param word - The word to capitalize.
 * @returns The word with the first letter capitalized.
 */
const capitalizeFirstLetter = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);

/**
 * A dropdown component for selecting style contracts.
 * @template T - The type of the contract declarations.
 */
export const StyleContractDropdown = forwardRef<
  HTMLButtonElement,
  React.PropsWithChildren<StyleContractDropdownProps<any>>
>(function StyleContractDropdown<T extends Contract>(
  {
    contracts,
    ...rest
  }: React.PropsWithChildren<StyleContractDropdownProps<T>>,
  ref: React.Ref<HTMLButtonElement>,
) {
  const { setContract } = useStyleContract<T>();

  const handleSelectionChange: DropdownProps<StyleContractDropdownOption<T> | null>["onSelectionChange"] =
    (_event, newSelected) => {
      const selectedOption = newSelected[0];
      if (!selectedOption) {
        setContract(null);
        return;
      }
      setContract(selectedOption ? selectedOption.contract : null);
    };

  const formatValue = (value: StyleContractDropdownOption<T> | null) =>
    value
      ? `${capitalizeFirstLetter(value.owner)} - ${capitalizeFirstLetter(value.contract.name)}`
      : SALT_DEFAULT_OPTION;

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
      {contracts.map(({ owner, contracts: contractItems }) => (
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
