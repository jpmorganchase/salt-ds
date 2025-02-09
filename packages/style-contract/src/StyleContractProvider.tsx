import {
  type Breakpoints,
  isResponsiveProp,
  resolveResponsiveValue,
  useBreakpoint,
  useBreakpoints,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { StyleContract } from "./StyleContract";

let providerInstanceCount = 0;

/**
 * Props for the StyleContractProvider component.
 * @template T - The type of the contract declarations.
 */
interface StyleContractProviderProps<T> {
  defaultContract: StyleContract<T>;
}

/**
 * Value provided by the StyleContractContext.
 * @template T - The type of the contract declarations.
 */
export interface StyleContractProviderValue<T> {
  contract: T;
  setContract: (newContract: StyleContract<T> | null) => void;
}

const StyleContractContext = createContext<
  StyleContractProviderValue<any> | undefined
>(undefined);

function generateCssFromContracts<T>(
  contract: T,
  matchedBreakpoints: (keyof Breakpoints)[],
  providerClass: string,
): string {
  const breakpoints = useBreakpoints();
  return Object.entries(contract)
    .reduce<string[]>((result, [componentSelector, contract]) => {
      const resolvedContract = isResponsiveProp(contract, breakpoints)
        ? resolveResponsiveValue(contract, matchedBreakpoints)
        : contract;

      if (resolvedContract) {
        const properties = Object.entries(resolvedContract)
          .map(([key, value]) => `--${key}: ${value};`)
          .join(" ");
        const rule = `.${providerClass} ${componentSelector} { ${properties} }`;
        result.push(rule);
      }
      return result;
    }, [])
    .join(" ");
}

/**
 * Provides a style contract to its children.
 * @template T - The type of the contract declarations.
 */
export function StyleContractProvider<T>({
  defaultContract,
  children,
}: React.PropsWithChildren<StyleContractProviderProps<T>>) {
  const [contract, setContractState] = useState(defaultContract);

  const setContract = (newContract: StyleContract<T> | null) => {
    setContractState(newContract || defaultContract);
  };

  const providerClass = `salt-style-contract-${providerInstanceCount++}`;
  const { matchedBreakpoints } = useBreakpoint();

  const css = useMemo(
    () =>
      generateCssFromContracts<T>(
        contract.contract,
        matchedBreakpoints,
        providerClass,
      ),
    [contract, matchedBreakpoints, providerClass],
  );

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: providerClass,
    css,
    window: targetWindow,
  });

  return (
    <StyleContractContext.Provider
      value={{ contract: contract.contract, setContract }}
    >
      <div className={providerClass}>{children}</div>
    </StyleContractContext.Provider>
  );
}

/**
 * Hook to use the style contract context.
 * @template T - The type of the contract declarations.
 */
export function useStyleContract<T>() {
  const context = useContext(
    StyleContractContext as React.Context<
      StyleContractProviderValue<T> | undefined
    >,
  );
  if (!context) {
    throw new Error(
      "useStyleContract must be used within a StyleContractProvider.",
    );
  }
  return context;
}
