/**
 * Props for creating a StyleContract.
 * @template T - The type of the contract declarations.
 */
export interface StyleContractProps<T> {
  name: string;
  contract: T;
}

/**
 * A style contract with a name and a set of contract declarations
 * @template T - The type of the contract declarations.
 */
export class StyleContract<T> {
  readonly name: string;
  readonly contract: T;

  constructor(props: StyleContractProps<T>) {
    this.name = props.name;
    this.contract = props.contract;
  }
}
