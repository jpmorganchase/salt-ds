/**
 * The contract may include:
 * - Custom overrides for component-level modifications
 * - System overrides that affect the entire design system
 */
export type Contract = {
  custom?: any;
  system?: any;
}

/**
 * Props for creating a StyleContract.
 * @template T - The type of the contract declarations.
 */
export interface StyleContractProps<T extends Contract> {
  name: string;
  contract: T;
}

/**
 * A style contract with a name and a set of contract declarations
 * @template T - The type of the contract declarations.
 */
export class StyleContract<T extends Contract> {
  readonly name: string;
  readonly contract: T;

  constructor(props: StyleContractProps<T>) {
    this.name = props.name;
    this.contract = props.contract;
  }
}
