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
  noContractAppliedLabel?: string;
}

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
    noContractAppliedLabel = "No contract applied",
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
    value ? `${value.owner} - ${value.contract.name}` : noContractAppliedLabel;

  return (
    <Dropdown
      ref={ref}
      defaultSelected={[null]}
      onSelectionChange={handleSelectionChange}
      valueToString={formatValue}
      {...rest}
    >
      <Option key="__salt_style_contract_none" value={null}>
        {noContractAppliedLabel}
      </Option>
      {contracts.map(({ owner, contracts: contractItems }) => (
        <OptionGroup key={owner} label={owner}>
          {contractItems.map((contract) => (
            <Option key={contract.name} value={{ owner, contract }}>
              {contract.name}
            </Option>
          ))}
        </OptionGroup>
      ))}
    </Dropdown>
  );
});
